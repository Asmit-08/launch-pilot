from datetime import datetime, timezone

from ai.agents import landing_page_agent
from core.entitlements import has_premium_access
from database.supabase_fetcher import supabase
from services.landing_page_fetcher import fetch_landing_page


class LandingPageService:

    @staticmethod
    def analyze_landing_page(data, current_user=None):

        # 1. Fetch landing page
        page_data = fetch_landing_page(data.url)

        # 2. Get saved ICP context only for authenticated users
        icp_context = None

        if data.use_saved_icp and current_user:
            icp_context = current_user.get("icp_context")

        # 3. Run AI analysis
        result = landing_page_agent(
            page_data,
            icp_context,
        )

        # 4. Save analysis only for authenticated users
        if current_user:
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
                print(
                    "Landing Page Storage Error:",
                    storage_error,
                )

        # 5. Premium is available only to authenticated
        #    users with premium access
        if current_user and has_premium_access(current_user):
            return result

        # 6. Free response
        #
        # This applies to:
        # - anonymous visitors
        # - authenticated free users
        #
        # Anonymous users therefore receive the same
        # limited analysis surface as the free plan.
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