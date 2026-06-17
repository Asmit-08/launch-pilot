import json

from ai.prompts import build_product_prompt, build_validation_prompt, build_launch_readiness_prompt, build_risk_prompt
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