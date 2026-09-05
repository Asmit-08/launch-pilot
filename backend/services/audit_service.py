from fastapi import HTTPException

from ai.agents import audit_agent

from repositories.repository_manager import audit_repository

from services.aggregator import aggregate_results
from services.decision_service import DecisionService
from services.usage_service import usage_service


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
            # ONE AI CALL
            # -----------------------------------

            audit_response = audit_agent(data)

            audit_result = audit_response["result"]
            ai_usage = audit_response["usage"]

            # -----------------------------------
            # Aggregate Results
            # -----------------------------------

            result = aggregate_results(
                audit_result["product"],
                audit_result["validation"],
                audit_result["launch_readiness"],
                audit_result["risk"],
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

            # -----------------------------------
            # Initialize V2 Startup State
            # -----------------------------------
            #
            # The audit provides initial signals.
            # DecisionService converts those signals
            # into persistent startup state:
            #
            # beliefs
            # constraint
            # first objective
            # decision
            # state events
            #
            # No additional AI call is made.

            startup_state = DecisionService.initialize_project(
                project=project,
                audit_result=result,
            )

            # -----------------------------------
            # Record Actual AI Usage
            # -----------------------------------

            usage_service.record_ai_usage(
                current_user,
                requests=ai_usage["requests"],
                tokens=ai_usage["total_tokens"],
            )

            # -----------------------------------
            # Return Result
            # -----------------------------------

            return {
                **result,
                "project_id": project["id"],
                "audit_id": session["id"],
                "startup_state": startup_state,
            }

        except HTTPException:
            # Preserve intentional HTTP errors.
            raise

        except Exception as e:
            print("AUDIT ERROR:", repr(e))
            raise HTTPException(
                status_code=500,
                detail=str(e),
            ) from e