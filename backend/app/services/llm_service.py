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

        # Construct prompt
        lang_name = "Telugu" if language == "te" else "English"

        # Section headers per language
        if language == "te":
            sec = {
                "given": "ఇవ్వబడింది",
                "calc": "గణన",
                "conclusion": "నిర్ణయం",
                "shortcut": "షార్ట్‌కట్ ట్రిక్",
                "therefore": "∴",
            }
        else:
            sec = {
                "given": "Given",
                "calc": "Calculation",
                "conclusion": "Conclusion",
                "shortcut": "Shortcut Trick",
                "therefore": "∴",
            }

        system_prompt = (
            f"You are Logicia, an advanced AI Math Tutor. "
            f"IMPORTANT: You MUST respond entirely in {lang_name}. Do not mix languages. "
            f"{'Use Telugu script (e.g., గణితం, సమీకరణం) for ALL explanations and labels.' if language == 'te' else ''}"
            "\n\n"
            "RESPONSE FORMAT — You MUST structure EVERY response using these exact sections:\n\n"
            f"**{sec['given']}:**\n"
            "Restate the problem clearly in your own words. Identify what is known and what is asked.\n\n"
            f"**{sec['calc']}:**\n"
            "Show a step-by-step solution. Rules:\n"
            "- Start each step on a new line\n"
            "- Use the ⇒ symbol to show results (e.g., 'After increase: 100 × 120% ⇒ Rs. 120')\n"
            "- Show every intermediate calculation — do NOT skip steps\n"
            "- Label what each step does (e.g., 'Step 1 — Identify the operation')\n"
            "- Use × for multiplication, ÷ for division, and standard math symbols\n\n"
            f"**{sec['therefore']} {sec['conclusion']}:**\n"
            "State the final answer in a single bold sentence.\n\n"
            f"**💡 {sec['shortcut']}** (optional but strongly encouraged):\n"
            "If a faster method, trick, formula, or mental math shortcut exists, show it here. "
            "Use a small table if it helps visualize the shortcut.\n\n"
            "ADDITIONAL RULES:\n"
            "- Keep the tone friendly but professional — like a great teacher\n"
            "- Use simple, easy-to-understand language\n"
            "- For exam-type problems (SSC, competitive), always include the Shortcut Trick section\n"
            "- Use **bold** for section headers and key results\n"
            "- Use mathematical notation naturally (², √, π, ∫, etc.)\n"
            "- IMPORTANT: For any LaTeX commands (like \\frac, \\sum, \\equiv) or complex expressions, you MUST wrap them in \\( ... \\) delimiters to ensure they render correctly.\n"
            "- If a graph or symbolic result is provided by the engine, reference it in your explanation\n"
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
            "temperature": 0.25,
            "max_tokens": 2048,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                # Safe choice access
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
