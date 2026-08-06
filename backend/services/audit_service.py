from ai.agents import (
    product_agent,
    validation_agent,
    launch_readiness_agent,
    risk_agent,
)

from repositories.repository_manager import (
    audit_repository,
)

from services.aggregator import aggregate_results


class AuditService:

    @staticmethod
    def generate_audit(data, current_user):

        try:

            # -----------------------------------
            # Create / Find Project
            # -----------------------------------

            project = audit_repository.get_project_by_name(
                user_id=current_user["id"],
                name=data.product_name,
            )

            if project is None:

                project = audit_repository.create_project(
                    user_id=current_user["id"],
                    name=data.product_name,
                    description=data.description,
                    website=None,
                    industry=None,
                    stage=(
                        "beta"
                        if data.beta_users > 0
                        else "building"
                        if data.mvp_completed
                        else "idea"
                    ),
                )

            # -----------------------------------
            # Create Audit Session
            # -----------------------------------

            session = audit_repository.create_audit_session(
                project_id=project["id"]
            )

            # -----------------------------------
            # Generate AI Audit
            # -----------------------------------

            product_result = product_agent(data)

            validation_result = validation_agent(data)

            launch_result = launch_readiness_agent(data)

            risk_result = risk_agent(data)

            result = aggregate_results(
                product_result,
                validation_result,
                launch_result,
                risk_result,
            )

            # -----------------------------------
            # Save Audit Result
            # -----------------------------------

            audit_repository.create_audit_result(
                audit_session_id=session["id"],
                overall_score=result["overall_score"],
                product_json=result["product"],
                validation_json=result["validation"],
                launch_json=result["launch_readiness"],
                risk_json=result["risk"],
            )

            return result

        except Exception as e:

            print("Audit Error:", e)

            return {
                "overall_score": 0,
                "product": {},
                "validation": {},
                "launch_readiness": {},
                "risk": {},
                "error": str(e),
            }