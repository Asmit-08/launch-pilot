import json

from backend.ai.prompts import build_product_prompt, build_validation_prompt, build_launch_readiness_prompt, build_risk_prompt
from backend.ai.gemini_client import generate_response


def product_agent(data):
    prompt = build_product_prompt(data)
    response = generate_response(prompt)
    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    if response is None:
        return {
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }

    return json.loads(response)



def validation_agent(data):

    prompt = build_validation_prompt(data)

    response = generate_response(prompt)

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    if response is None:
        return {
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }

    return json.loads(response)


def launch_readiness_agent(data):

    prompt = build_launch_readiness_prompt(data)

    response = generate_response(prompt)

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    if response is None:
        return {
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }

    return json.loads(response)


def risk_agent(data):

    prompt = build_risk_prompt(data)

    response = generate_response(prompt)

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    if response is None:
        return {
        "score": 0,
        "critical_risks": [],
        "mitigation": []
    }

    return json.loads(response)