import json
from ai.prompts import build_audit_prompt
from ai.gemini_client import generate_response
from ai.agents import (
    product_agent,
    validation_agent,
    launch_readiness_agent,
    risk_agent
)

from services.aggregator import aggregate_results

class AuditService:

    @staticmethod
    def generate_audit(data):

        try:

            product_result = product_agent(data)

            validation_result = validation_agent(data)

            launch_result = launch_readiness_agent(data)

            risk_result = risk_agent(data)

            return aggregate_results(
                product_result,
                validation_result,
                launch_result,
                risk_result
            )

        except Exception as e:

            print("Audit Error:", e)

            return {
                "overall_score": 0,
                "product": {},
                "validation": {},
                "launch_readiness": {},
                "risk": {},
                "error": str(e)
            }