import json

from ai.prompts import build_product_prompt, build_validation_prompt, build_launch_readiness_prompt, build_risk_prompt, build_landing_page_prompt
from ai.gemini_client import generate_response


def product_agent(data):
    prompt = build_product_prompt(data)
    response = generate_response(prompt)

    if response is None:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": []
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)



def validation_agent(data):

    prompt = build_validation_prompt(data)

    response = generate_response(prompt)

    if response is None:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": []
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)


def launch_readiness_agent(data):

    prompt = build_launch_readiness_prompt(data)

    response = generate_response(prompt)

    if response is None:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": []
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)


def risk_agent(data):

    prompt = build_risk_prompt(data)

    response = generate_response(prompt)

    if response is None:
        return {
            "score": 0,
            "critical_risks": [],
            "mitigation": []
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)


from ai.prompts import build_persona_prompt 


def persona_agent(data):
    prompt = build_persona_prompt(data)
    response = generate_response(prompt)

    if response is None:
        return {
            "executive_summary": "",
            "ideal_customer_profile": "",
            "persona": {},
            "pain_points": [],
            "goals": [],
            "motivations": [],
            "buying_triggers": [],
            "buying_behaviour": "",
            "common_objections": [],
            "marketing_channels": [],
            "messaging_recommendations": [],
            "content_ideas": [],
            "confidence_score": 0
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)

def landing_page_agent(
    page_data: dict,
    icp_context: dict | None = None,
):
    prompt = build_landing_page_prompt(
        page_data,
        icp_context,
    )

    response = generate_response(prompt)

    if response is None:
        return {
            "overall_score": 0,
            "executive_summary": "",
            "value_proposition": {
                "score": 0,
                "summary": "",
            },
            "messaging": {
                "score": 0,
                "summary": "",
            },
            "cta": {
                "score": 0,
                "summary": "",
            },
            "trust": {
                "score": 0,
                "summary": "",
            },
            "conversion_clarity": {
                "score": 0,
                "summary": "",
            },
            "icp_alignment": {
                "score": 0,
                "summary": "",
            },
            "conversion_problems": [],
            "recommendations": [],
        }

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    return json.loads(response)