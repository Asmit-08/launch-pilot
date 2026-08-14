from datetime import datetime, timezone

from ai.agents import landing_page_agent
from core.entitlements import has_premium_access
from database.supabase_fetcher import supabase
from services.landing_page_fetcher import fetch_landing_page


class LandingPageService:

    @staticmethod
    def analyze_landing_page(data, current_user):

        try:
            # ---------------------------------------------------------
            # 1. Fetch landing page
            # ---------------------------------------------------------

            page_data = fetch_landing_page(data.url)

            # ---------------------------------------------------------
            # 2. Get saved ICP context
            # ---------------------------------------------------------

            icp_context = current_user.get("icp_context")

            # ---------------------------------------------------------
            # 3. Run AI analysis
            # ---------------------------------------------------------

            result = landing_page_agent(
                page_data,
                icp_context,
            )

            # ---------------------------------------------------------
            # 4. Save analysis
            # ---------------------------------------------------------
            #
            # Every analysis belongs to the authenticated user.
            #
            # project_id is intentionally NULL for the EAM because
            # the user may not have a project yet.
            #
            # We store the complete analysis so that the analysis
            # can later be retrieved from the dashboard/history.
            # ---------------------------------------------------------

            try:

                user_id = current_user["id"]

                category_scores = {
                    "value_proposition": result.get(
                        "value_proposition",
                        {},
                    ),
                    "messaging": result.get(
                        "messaging",
                        {},
                    ),
                    "cta": result.get(
                        "cta",
                        {},
                    ),
                    "trust": result.get(
                        "trust",
                        {},
                    ),
                    "conversion_clarity": result.get(
                        "conversion_clarity",
                        {},
                    ),
                    "icp_alignment": result.get(
                        "icp_alignment",
                        {},
                    ),
                }

                supabase.table(
                    "landing_page_analyses"
                ).insert(
                    {
                        "user_id": user_id,
                        "project_id": None,
                        "url": page_data.get(
                            "url",
                            data.url,
                        ),
                        "overall_score": result.get(
                            "overall_score",
                            0,
                        ),
                        "category_scores": category_scores,
                        "analysis_json": result,
                        "created_at": datetime.now(
                            timezone.utc
                        ).isoformat(),
                    }
                ).execute()

                print(
                    "Landing page analysis saved successfully."
                )

            except Exception as storage_error:

                # A database failure should NOT destroy an otherwise
                # successful AI analysis.
                print(
                    "Landing Page Storage Error:",
                    storage_error,
                )

            # ---------------------------------------------------------
            # 5. Premium
            # ---------------------------------------------------------

            if has_premium_access(current_user):
                return result

            # ---------------------------------------------------------
            # 6. Freemium
            # ---------------------------------------------------------
            #
            # Free users receive:
            # - Overall score
            # - Executive summary
            # - Messaging
            #
            # Everything else remains Premium.
            # ---------------------------------------------------------

            return {
                "overall_score": result.get(
                    "overall_score",
                    0,
                ),
                "executive_summary": result.get(
                    "executive_summary",
                    "",
                ),
                "messaging": result.get(
                    "messaging",
                    {
                        "score": 0,
                        "summary": "",
                    },
                ),
            }

        except Exception as e:

            print(
                "Landing Page Analysis Error:",
                e,
            )

            return {
                "overall_score": 0,
                "executive_summary": "",
                "messaging": {
                    "score": 0,
                    "summary": "",
                },
                "error": str(e),
            }