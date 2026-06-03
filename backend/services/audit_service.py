import json
from backend.ai.prompts import build_audit_prompt
from backend.ai.gemini_client import generate_response

class AuditService:

    @staticmethod
    def generate_audit(data):

                prompt = build_audit_prompt(data)

                response = generate_response(prompt)

                response = response.replace("```json", "")
                response = response.replace("```", "")
                response = response.strip()

                try:
                        audit_data = json.loads(response)

                        return audit_data
                except Exception as e:
                        print("JSON Parse Error:", e)
                        print("Gemini Response:", response)

                return{
                        "readiness_score": 0,
                        "summary": "Failed to parse AI response.",
                        "missing_assets": [],
                        "risks": [],
                        "recommendations": []
                }
        