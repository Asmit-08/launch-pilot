from datetime import date, datetime, timezone

from fastapi import HTTPException, status

from repositories.repository_manager import usage_repository


PLAN_LIMITS = {
    "free": {
        "audits": 3,
        "chat_messages": 3,
        "personas": 2,
        "landing_page_analyses": 2,
    },
    "premium": {
        "audits": 20,
        "chat_messages": 100,
        "personas": 20,
        "landing_page_analyses": 20,
    },
}


class UsageService:

    def _get_or_create_usage(self, user_id: str):
        usage = usage_repository.get_usage(user_id)

        if usage is None:
            usage = usage_repository.create_usage(user_id)

        return usage

    def _reset_if_new_month(self, usage: dict):
        current_month = date.today().replace(day=1)

        usage_month = date.fromisoformat(
            usage["usage_period_start"]
        ).replace(day=1)

        if usage_month != current_month:
            usage = usage_repository.update_usage(
                usage["user_id"],
                {
                    "audits_used": 0,
                    "chat_messages_used": 0,
                    "personas_used": 0,
                    "landing_page_analyses_used": 0,
                    "ai_requests_used": 0,
                    "ai_tokens_used": 0,
                    "usage_period_start": current_month.isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                },
            )

        return usage

    def _get_plan(self, user: dict):
        plan = user.get("subscription", "free")

        if plan not in PLAN_LIMITS:
            plan = "free"

        return plan

    def check_limit(self, user: dict, resource: str):
        """
        Check whether the user is allowed to perform an operation.

        Does NOT consume usage.
        """

        if resource not in PLAN_LIMITS["free"]:
            raise ValueError(
                f"Unknown usage resource: {resource}"
            )

        user_id = user["auth_user_id"]
        plan = self._get_plan(user)

        usage = self._get_or_create_usage(user_id)
        usage = self._reset_if_new_month(usage)

        usage_column = f"{resource}_used"

        current_usage = usage.get(
            usage_column,
            0,
        )

        limit = PLAN_LIMITS[plan][resource]

        if current_usage >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "usage_limit_reached",
                    "resource": resource,
                    "plan": plan,
                    "limit": limit,
                    "used": current_usage,
                },
            )

        return {
            "allowed": True,
            "plan": plan,
            "used": current_usage,
            "limit": limit,
            "remaining": limit - current_usage,
        }

    def consume(self, user: dict, resource: str):
        """
        Consume one unit of usage after a successful operation.
        """

        if resource not in PLAN_LIMITS["free"]:
            raise ValueError(
                f"Unknown usage resource: {resource}"
            )

        user_id = user["auth_user_id"]

        usage = self._get_or_create_usage(user_id)
        usage = self._reset_if_new_month(usage)

        usage_column = f"{resource}_used"

        current_usage = usage.get(
            usage_column,
            0,
        )

        return usage_repository.update_usage(
            user_id,
            {
                usage_column: current_usage + 1,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
        )

    def record_ai_usage(
        self,
        user: dict,
        requests: int = 1,
        tokens: int = 0,
    ):
        """
        Record actual AI consumption.
        """

        user_id = user["auth_user_id"]

        usage = self._get_or_create_usage(user_id)
        usage = self._reset_if_new_month(usage)

        return usage_repository.update_usage(
            user_id,
            {
                "ai_requests_used": (
                    usage["ai_requests_used"] + requests
                ),
                "ai_tokens_used": (
                    usage["ai_tokens_used"] + tokens
                ),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
        )

    def get_usage_status(self, user: dict):
        user_id = user["auth_user_id"]
        plan = self._get_plan(user)

        usage = self._get_or_create_usage(user_id)
        usage = self._reset_if_new_month(usage)

        return {
            "plan": plan,

            "usage": {
                "audits": {
                    "used": usage["audits_used"],
                    "limit": PLAN_LIMITS[plan]["audits"],
                    "remaining": max(
                        PLAN_LIMITS[plan]["audits"]
                        - usage["audits_used"],
                        0,
                    ),
                },

                "chat_messages": {
                    "used": usage["chat_messages_used"],
                    "limit": PLAN_LIMITS[plan]["chat_messages"],
                    "remaining": max(
                        PLAN_LIMITS[plan]["chat_messages"]
                        - usage["chat_messages_used"],
                        0,
                    ),
                },

                "personas": {
                    "used": usage["personas_used"],
                    "limit": PLAN_LIMITS[plan]["personas"],
                    "remaining": max(
                        PLAN_LIMITS[plan]["personas"]
                        - usage["personas_used"],
                        0,
                    ),
                },

                "landing_page_analyses": {
                    "used": usage[
                        "landing_page_analyses_used"
                    ],
                    "limit": PLAN_LIMITS[plan][
                        "landing_page_analyses"
                    ],
                    "remaining": max(
                        PLAN_LIMITS[plan][
                            "landing_page_analyses"
                        ]
                        - usage[
                            "landing_page_analyses_used"
                        ],
                        0,
                    ),
                },
            },

            "ai": {
                "requests_used": usage[
                    "ai_requests_used"
                ],
                "tokens_used": usage[
                    "ai_tokens_used"
                ],
            },

            "period_start": usage[
                "usage_period_start"
            ],
        }


usage_service = UsageService()