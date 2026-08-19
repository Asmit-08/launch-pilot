from google import genai

from config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)


def generate_response(prompt: str):
    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        usage_metadata = getattr(response, "usage_metadata", None)

        prompt_tokens = getattr(
            usage_metadata,
            "prompt_token_count",
            0,
        ) or 0

        output_tokens = getattr(
            usage_metadata,
            "candidates_token_count",
            0,
        ) or 0

        total_tokens = getattr(
            usage_metadata,
            "total_token_count",
            0,
        ) or 0

        return {
            "text": response.text,
            "prompt_tokens": prompt_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
        }

    except Exception as e:
        print(f"Gemini Failure: {e}")
        return None