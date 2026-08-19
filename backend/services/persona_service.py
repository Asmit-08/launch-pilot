from datetime import datetime, timezone

from ai.agents import persona_agent
from core.entitlements import has_premium_access
from database.supabase_fetcher import supabase


class PersonaService:

    @staticmethod
    def generate_persona(data, current_user):

        # ---------------------------------------------------------
        # 1. Generate the complete persona
        # ---------------------------------------------------------

        # IMPORTANT:
        # Do NOT swallow this exception.
        # If AI generation fails, the router must know that the
        # operation failed so usage is NOT consumed.
        result = persona_agent(data)

        # ---------------------------------------------------------
        # 2. Save compact ICP memory
        # ---------------------------------------------------------

        # Memory failure must NOT invalidate a successful generation.
        try:

            icp_context = {
                "inputs": {
                    "what_are_you_building": data.what_are_you_building,
                    "product_description": data.product_description,
                    "additional_details": data.additional_details,
                },

                "executive_summary": result.get(
                    "executive_summary",
                    "",
                ),

                "persona": result.get(
                    "persona",
                    {},
                ),

                "confidence_score": result.get(
                    "confidence_score",
                    0,
                ),

                "updated_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            }

            # Remove empty optional fields.
            icp_context["inputs"] = {
                key: value
                for key, value in icp_context["inputs"].items()
                if value not in (None, "")
            }

            user_id = current_user["id"]

            supabase.table("users").update(
                {
                    "icp_context": icp_context,
                }
            ).eq(
                "id",
                user_id,
            ).execute()

            print("ICP memory saved successfully.")

        except Exception as memory_error:

            # A database/memory failure does NOT affect the
            # already-successful ICP generation.
            print(
                "ICP Memory Error:",
                memory_error,
            )

        # ---------------------------------------------------------
        # 3. Apply subscription-based response filtering
        # ---------------------------------------------------------

        if has_premium_access(current_user):
            return result

        # ---------------------------------------------------------
        # Free users
        # ---------------------------------------------------------

        return {
            "confidence_score": result.get(
                "confidence_score",
                0,
            ),
            "executive_summary": result.get(
                "executive_summary",
                "",
            ),
            "persona": result.get(
                "persona",
                {},
            ),
        }