import httpx
from typing import Dict, Any, Optional
from app.config import settings

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = settings.OPENROUTER_MODEL or "google/gemini-2.0-flash-001"

    async def generate_response(self, user_query: str, math_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
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
        system_prompt = (
            "You are Logicia, an advanced AI Math Tutor. Your role is to provide clear, "
            "pedagogical explanations for mathematical problems. "
            "You are provided with a user query and a symbolic result from a math engine. "
            "Focus on explaining the 'why' and the steps involved. "
            "Use LaTeX for mathematical notation (e.g., $x^2$, $\\frac{a}{b}$)."
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
            "temperature": 0.3,
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
                
                content = data["choices"][0]["message"]["content"]
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
