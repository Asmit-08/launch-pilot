from datetime import datetime, timezone

from ai.agents import persona_agent
from core.entitlements import has_premium_access
from database.supabase_fetcher import supabase


class PersonaService:

    @staticmethod
    def generate_persona(data, current_user):

        try:
            # ---------------------------------------------------------
            # 1. Generate the complete persona
            # ---------------------------------------------------------

            result = persona_agent(data)

            # ---------------------------------------------------------
            # 2. Save compact ICP memory
            # ---------------------------------------------------------
            #
            # Memory is intentionally kept small.
            #
            # We store:
            # - Original ICP inputs
            # - Executive summary
            # - Core persona
            # - Confidence score
            #
            # Regenerating the ICP replaces the previous context.
            #
            # IMPORTANT:
            # A memory/database failure must NOT make a successful
            # persona generation fail.
            # ---------------------------------------------------------

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

                # current_user comes from get_current_user(),
                # which resolves the user from the authenticated JWT.
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

                # Memory failure should NOT affect the generated ICP.
                print(
                    "ICP Memory Error:",
                    memory_error,
                )

            # ---------------------------------------------------------
            # 3. Apply subscription-based response filtering
            # ---------------------------------------------------------

            # Premium + Super Premium:
            # Return the complete AI-generated analysis.
            if has_premium_access(current_user):
                return result

            # Freemium:
            # Keep the complete analysis internal,
            # but expose only the three free fields.
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

        except Exception as e:

            print(
                "Persona Error:",
                e,
            )

            # ---------------------------------------------------------
            # 4. Generation failure fallback
            # ---------------------------------------------------------

            return {
                "confidence_score": 0,
                "executive_summary": "",
                "ideal_customer_profile": "",
                "persona": {
                    "name": "",
                    "age_range": "",
                    "occupation": "",
                    "description": "",
                },
                "pain_points": [],
                "goals": [],
                "motivations": [],
                "buying_triggers": [],
                "buying_behaviour": "",
                "common_objections": [],
                "marketing_channels": [],
                "messaging_recommendations": [],
                "content_ideas": [],
                "error": str(e),
            }

