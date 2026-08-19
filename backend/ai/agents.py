import json

from ai.prompts import (
    build_combined_audit_prompt,
    build_persona_prompt,
    build_landing_page_prompt,
)

from ai.gemini_client import generate_response


def audit_agent(data):
    prompt = build_combined_audit_prompt(data)

    response = generate_response(prompt)

    if response is None:
        raise RuntimeError("AI audit generation failed.")

    text = response["text"]

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            "AI returned invalid audit JSON."
        ) from e

    required_sections = [
        "product",
        "validation",
        "launch_readiness",
        "risk",
    ]

    for section in required_sections:
        if section not in result:
            raise RuntimeError(
                f"AI audit response missing section: {section}"
            )

    return {
        "result": result,
        "usage": {
            "requests": 1,
            "prompt_tokens": response["prompt_tokens"],
            "output_tokens": response["output_tokens"],
            "total_tokens": response["total_tokens"],
        },
    }


def persona_agent(data):
    prompt = build_persona_prompt(data)

    response = generate_response(prompt)

    # AI generation failed.
    # Let the error propagate so the usage counter
    # is not consumed by the router.
    if response is None:
        raise RuntimeError(
            "Persona AI generation failed."
        )

    text = response["text"]

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        result = json.loads(text)

    except json.JSONDecodeError as e:
        raise RuntimeError(
            "AI returned invalid persona JSON."
        ) from e

    return result

def landing_page_agent(
    page_data: dict,
    icp_context: dict | None = None,
):
    prompt = build_landing_page_prompt(
        page_data,
        icp_context,
    )

    response = generate_response(prompt)

    # AI generation failed.
    # Let the exception propagate so the usage counter
    # is NOT consumed.
    if response is None:
        raise RuntimeError(
            "Landing page AI analysis failed."
        )

    text = response["text"]

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        result = json.loads(text)

    except json.JSONDecodeError as e:
        raise RuntimeError(
            "AI returned invalid landing page analysis JSON."
        ) from e

    return result