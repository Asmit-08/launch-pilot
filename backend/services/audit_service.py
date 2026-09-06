from fastapi import HTTPException

from ai.agents import audit_agent
from repositories.repository_manager import audit_repository
from services.aggregator import aggregate_results
from services.decision_service import DecisionService
from services.usage_service import usage_service
from services.landing_page_service import fetch_landing_page


class AuditService:
    @staticmethod
    def generate_audit(data, current_user):
        try:
            # =====================================================
            # 1. FETCH WEBSITE
            # =====================================================
            #
            # The website is now the primary source of product
            # context. The landing-page fetcher only retrieves
            # evidence; the AI audit interprets that evidence.
            #
            landing_page_data = fetch_landing_page(
                data.website
            )

            # =====================================================
            # 2. CREATE / GET PROJECT
            # =====================================================
            #
            # Product name is no longer supplied by the frontend.
            # Use the website host as a stable project identifier
            # until the AI-derived product context is available.
            #
            website = data.website.strip()

            project_name = (
                landing_page_data.get("title", "").strip()
                or website
            )

            project = audit_repository.get_project_by_name(
                user_id=current_user["id"],
                name=project_name,
            )

            if project is None:
                project = audit_repository.create_project(
                    user_id=current_user["id"],
                    name=project_name,
                    description=None,
                    website=website,
                    industry=None,
                    stage=(
                        "beta"
                        if data.beta_users > 0
                        else "building"
                        if data.mvp_completed
                        else "idea"
                    ),
                )

            # =====================================================
            # 3. CREATE AUDIT SESSION
            # =====================================================

            session = audit_repository.create_audit_session(
                project_id=project["id"]
            )

            # =====================================================
            # 4. RUN SINGLE AI AUDIT
            # =====================================================
            #
            # audit_agent receives:
            # - founder-provided facts
            # - fetched landing-page evidence
            #
            # The AI can infer product name, positioning,
            # audience, messaging, etc. from the website instead
            # of forcing the founder to manually enter them.
            #
            audit_response = audit_agent(
                data,
                landing_page_data=landing_page_data,
            )

            audit_result = audit_response["result"]
            ai_usage = audit_response["usage"]

            # =====================================================
            # 5. AGGREGATE FOUR AUDIT SECTIONS
            # =====================================================

            result = aggregate_results(
                audit_result["product"],
                audit_result["validation"],
                audit_result["launch_readiness"],
                audit_result["risk"],
            )

            # =====================================================
            # 6. SAVE AUDIT RESULT
            # =====================================================

            audit_repository.create_audit_result(
                audit_session_id=session["id"],
                overall_score=result["overall_score"],
                product_json=result["product"],
                validation_json=result["validation"],
                launch_json=result["launch_readiness"],
                risk_json=result["risk"],
            )

            # =====================================================
            # 7. INITIALIZE STARTUP DECISION STATE
            # =====================================================

            startup_state = DecisionService.initialize_project(
                project=project,
                audit_result=result,
            )

            # =====================================================
            # 8. RECORD AI USAGE
            # =====================================================

            usage_service.record_ai_usage(
                current_user,
                requests=ai_usage["requests"],
                tokens=ai_usage["total_tokens"],
            )

            # =====================================================
            # 9. RETURN RESULT
            # =====================================================

            return {
                **result,
                "project_id": project["id"],
                "audit_id": session["id"],
                "startup_state": startup_state,
            }

        except HTTPException:
            raise

        except ValueError as e:
            # URL validation / landing-page fetching errors
            # should be returned cleanly to the frontend.
            raise HTTPException(
                status_code=400,
                detail=str(e),
            ) from e

        except Exception as e:
            print("AUDIT ERROR:", repr(e))

            raise HTTPException(
                status_code=500,
                detail=str(e),
            ) from e