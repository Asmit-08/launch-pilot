from backend.ai.gemini_client import generate_response


def chat_agent(
    message: str,
    audit_result: dict,
    startup_data: dict,
    chat_history: list
):

    prompt = f"""
You are Launch Pilot's AI Co-Founder.

Your job is to help startup founders improve their chances of success.

Startup Information:
{startup_data}

Audit Report:
{audit_result}

Previous Conversation:
{chat_history}

Founder Question:
{message}

Instructions:
- Give practical and actionable advice.
- Reference the startup by name when relevant.
- Use information from the audit report.
- Be concise but insightful.
- Focus on startup growth, validation, product strategy, launch readiness, and risk mitigation.
- Do not invent information that is not present in the startup data or audit report.
- Only use information present in the startup information, audit report, or chat history.
- If information is missing, explicitly say so.
- Do not assume user counts, budgets, competitors, or metrics that are not provided.
"""

    response = generate_response(prompt)

    if response is None:
        return {
            "response": (
                "Sorry, I couldn't generate a response at the moment."
            )
        }

    return {
        "response": response
    }