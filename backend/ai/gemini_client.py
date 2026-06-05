from google import genai
from backend.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)
print(len(GEMINI_API_KEY))


def generate_response(prompt: str):
    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        return response.text

    except Exception as e:
        print(f"Gemini Failure: {e}")

        return None


