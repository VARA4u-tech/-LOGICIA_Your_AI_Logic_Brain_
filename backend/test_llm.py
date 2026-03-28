import asyncio
import os
import sys

# Add the current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app.services.llm_service import llm_service

async def test_llm():
    print("--- Testing OpenRouter Integration ---")
    print(f"Model configured: {llm_service.model}")
    print("Thinking...")
    
    # Simple query
    query = "Explain why humans use base-10 for mathematics."
    response = await llm_service.generate_response(query)
    
    if response["llm_used"]:
        print("\n[SUCCESS] Received response from OpenRouter:")
        print("-" * 40)
        print(response["content"])
        print("-" * 40)
    else:
        print("\n[FAILURE] LLM was not used. Reason:")
        print(response["content"])

if __name__ == "__main__":
    asyncio.run(test_llm())
