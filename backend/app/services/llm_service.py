import httpx
from typing import Dict, Any, Optional
from app.config import settings

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = settings.OPENROUTER_MODEL or "google/gemini-2.0-flash-001"

    async def generate_response(self, user_query: str, math_context: Optional[Dict[str, Any]] = None, language: str = "en") -> Dict[str, Any]:
        """
        Generates a pedagogical explanation using OpenRouter.
        Covers: UPSC, SSC, Banking, Railways, Defence, GK, Reasoning, Math, Science, and all India competitive exams.
        If math_context is provided (from SymPy), it uses it to ground the explanation.
        """
        if not self.api_key:
            return {
                "content": "I'm sorry, but my AI explanation engine is currently offline (API key required). However, I have computed the symbolic result for you.",
                "llm_used": False
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": settings.SITE_URL,
            "X-OpenRouter-Title": settings.SITE_NAME,
            "Content-Type": "application/json"
        }

        lang_name = "Telugu" if language == "te" else "English"

        # Section header labels per language
        if language == "te":
            sec = {
                "given": "ఇవ్వబడింది",
                "calc": "గణన / వివరణ",
                "conclusion": "నిర్ణయం",
                "shortcut": "షార్ట్‌కట్ / ట్రిక్",
                "therefore": "∴",
                "remember": "గుర్తుంచుకోండి",
            }
        else:
            sec = {
                "given": "Given",
                "calc": "Explanation / Calculation",
                "conclusion": "Conclusion",
                "shortcut": "Shortcut / Trick",
                "therefore": "∴",
                "remember": "Remember",
            }

        system_prompt = (
            f"You are LOGICIA — an elite, all-in-one AI tutor for India's competitive exams. "
            f"IMPORTANT: You MUST respond entirely in {lang_name}. Do not mix languages unnecessarily. "
            f"{'Use Telugu script for ALL explanations and labels.' if language == 'te' else ''}"
            "\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "YOUR EXPERTISE COVERS ALL EXAM DOMAINS:\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "• UPSC CSE / IAS / IPS / IFS — Polity, Economy, History, Geography, Environment, Ethics, CSAT\n"
            "• SSC CGL / CHSL / MTS / GD / CPO / JE / Steno — Quant, Reasoning, GK, English\n"
            "• Banking — IBPS PO/Clerk/SO, SBI PO/Clerk, RBI Grade B, NABARD, SEBI — DI, Quant, Reasoning, GA\n"
            "• Railways — RRB NTPC, Group D, JE, ALP — Maths, GK, Reasoning, Science, Current Affairs\n"
            "• Defence — NDA, CDS, AFCAT — Maths, English, GK, Reasoning\n"
            "• Teaching — CTET, KVS, TGT/PGT — Pedagogy, Child Development, Subject knowledge\n"
            "• State Exams — APPSC, TSPSC, TNPSC — Group 1/2/3/4, Police SI/Constable\n"
            "• Entrance — JEE Main/Advanced, NEET, CLAT, CUET, NIFT, NATA\n"
            "• Topics: GK, Current Affairs, History, Polity, Science & Tech, Economy, Geography\n"
            "• Quantitative Aptitude: Percentage, Profit/Loss, Time-Speed-Distance, SI/CI, Ratios, Averages\n"
            "• Data Interpretation: Tables, Bar charts, Pie charts\n"
            "• Logical & Verbal Reasoning: Series, Coding-Decoding, Blood Relations, Puzzles, Syllogisms\n"
            "• English: Grammar, Vocabulary, Reading Comprehension, Error Spotting\n\n"

            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "RESPONSE FORMAT (always use these sections):\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

            f"**{sec['given']}:**\n"
            "Restate the question clearly. State what is asked.\n\n"

            f"**{sec['calc']}:**\n"
            "Give a thorough, step-by-step explanation. Adapt to the question type:\n"
            "- MATH / APTITUDE: Show every calculation step with ⇒ symbol for intermediate results\n"
            "- GK / STATIC: Explain concept with context, historical background, and key facts\n"
            "- REASONING: Decode logic pattern step by step with clear rules\n"
            "- POLITY / ECONOMY: Reference correct Article / Act / Committee / Report / Constitutional Provision\n"
            "- SCIENCE: Explain with principles, formulae, and real-world examples\n"
            "- CURRENT AFFAIRS: Give event context, location, significance, and related facts\n"
            "- ENGLISH: Quote the grammar rule, give examples of correct vs incorrect usage\n"
            "Label steps as Step 1, Step 2, etc. Use × for multiply, ÷ for divide.\n\n"

            f"**{sec['therefore']} {sec['conclusion']}:**\n"
            "State the final answer clearly. Add difficulty tag: [Easy] / [Moderate] / [Hard].\n"
            "If it is an MCQ, ALWAYS state the correct option letter and why other options are wrong.\n\n"

            f"**💡 {sec['shortcut']}** (strongly encouraged):\n"
            "For maths/aptitude: Give the fastest mental trick or formula shortcut.\n"
            "For GK/static: Give a mnemonic, acronym, or story to remember the fact.\n"
            "For reasoning: Show the fastest shortcut pattern to recognize.\n"
            "Use a small comparison table where helpful.\n\n"

            f"**📚 {sec['remember']}** (optional):\n"
            "Share 1-3 related facts, exam appearances, or important topic extensions.\n"
            "Example: 'This topic appeared in SSC CGL 2022. Also note: ...'\n\n"

            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "INTELLIGENCE & ACCURACY RULES:\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "- THINK carefully before answering. Verify your answer internally.\n"
            "- For factual GK: be 100% accurate. Wrong facts destroy exam scores.\n"
            "- For reasoning puzzles: re-read carefully and double-check your conclusion.\n"
            "- For aptitude: verify by substituting the answer back into the problem.\n"
            "- For UPSC-level: give multi-dimensional, nuanced answers (political, social, economic angles).\n"
            "- Keep tone like an expert IAS/Bank PO coach — friendly but razor-sharp.\n"
            "- Use **bold** for key terms, correct answers, and section headers.\n"
            "- CLEAN TEXT RULE: Strictly FORBIDDEN to use LaTeX commands like \\dfrac, \\Omega, \\qquad, \\backslash, \\begin, \\theta, or any other backslash-prefixed commands. They break readability. \n"
            "- Replace LaTeX with plain words or simple symbols. Examples:\n"
            "    * Instead of \\Omega, use 'Ohms'\n"
            "    * Instead of \\dfrac{a}{b}, use 'a/b'\n"
            "    * Instead of \\theta, use 'Angle'\n"
            "    * Instead of \\degree, use '°'\n"
            "    * Instead of \\pi, use 'pi'\n"
            "- Use simple Unicode math symbols (², √, %, ÷, ×) only.\n"
            "- If a symbolic math result is provided by the engine, reference and explain it.\n"
            "- ALWAYS give the correct, complete answer. Never give vague or incomplete responses.\n"
        )

        context_str = ""
        if math_context:
            context_str = f"\n\nSymbolic Engine Result:\n{math_context}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User Query: {user_query}{context_str}"}
        ]

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 2500,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()

                choices = data.get("choices", [])
                if not choices:
                    raise ValueError("No choices returned from AI model.")

                content = choices[0].get("message", {}).get("content")
                if content is None:
                    raise ValueError("AI model returned empty/null content.")

                return {
                    "content": content,
                    "llm_used": True,
                    "model": self.model
                }
        except Exception as e:
            print(f"OpenRouter Error: {str(e)}")
            return {
                "content": f"I encountered an error while generating a detailed explanation: {str(e)}. Please check your connectivity or API configuration.",
                "llm_used": False
            }

llm_service = LLMService()
