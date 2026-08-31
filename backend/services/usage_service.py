from datetime import date, datetime, timezone

from fastapi import HTTPException, status

from repositories.repository_manager import usage_repository


# ================================================================
# PLAN LIMITS
# ================================================================

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

    # Super premium currently has no separate feature limits.
    # Until separate limits are defined, it uses premium limits.
    "super_premium": {
        "audits": 20,
        "chat_messages": 100,
        "personas": 20,
        "landing_page_analyses": 20,
    },
}


# ================================================================
# RESOURCE → DATABASE COLUMN
# ================================================================

USAGE_COLUMNS = {
    "audits": "audits_used",
    "chat_messages": "chat_messages_used",
    "personas": "personas_used",
    "landing_page_analyses": "landing_page_analyses_used",
}


class UsageService:

    # ============================================================
    # USAGE RECORD
    # ============================================================

    def _get_or_create_usage(
        self,
        user_id: str,
    ):
        """
        Get the user's usage row.

        If one does not exist, create it.
        """

        if not user_id:
            raise ValueError(
                "user_id is required."
            )

        usage = usage_repository.get_usage(
            user_id
        )

        if usage is not None:
            return usage

        usage = usage_repository.create_usage(
            user_id
        )

        if usage is None:
            raise RuntimeError(
                "Unable to create user usage record."
            )

        return usage

    # ============================================================
    # MONTH RESET
    # ============================================================

    def _reset_if_new_month(
        self,
        usage: dict,
    ):
        """
        Reset monthly usage counters when the usage period
        belongs to a previous calendar month.

        Uses UTC consistently.
        """

        usage_period_start = usage.get(
            "usage_period_start"
        )

        if not usage_period_start:
            raise RuntimeError(
                "Usage record is missing usage_period_start."
            )

        try:
            usage_date = date.fromisoformat(
                str(usage_period_start)
            )

        except ValueError as exc:
            raise RuntimeError(
                "Invalid usage_period_start."
            ) from exc

        current_month = datetime.now(
            timezone.utc
        ).date().replace(day=1)

        usage_month = usage_date.replace(
            day=1
        )

        if usage_month == current_month:
            return usage

        updated_usage = usage_repository.update_usage(
            usage["user_id"],
            {
                "audits_used": 0,
                "chat_messages_used": 0,
                "personas_used": 0,
                "landing_page_analyses_used": 0,
                "ai_requests_used": 0,
                "ai_tokens_used": 0,
                "usage_period_start": (
                    current_month.isoformat()
                ),
                "updated_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            },
        )

        if updated_usage is None:
            raise RuntimeError(
                "Failed to reset monthly usage."
            )

        return updated_usage

    # ============================================================
    # PLAN
    # ============================================================

    def _get_plan(
        self,
        user: dict,
    ) -> str:
        """
        Resolve the user's subscription plan.

        Missing subscription defaults to free.

        Unknown subscription values also default to free
        as a defensive fallback.
        """

        plan = user.get(
            "subscription",
            "free",
        )

        if plan not in PLAN_LIMITS:
            return "free"

        return plan

    # ============================================================
    # RESOURCE VALIDATION
    # ============================================================

    def _get_usage_column(
        self,
        resource: str,
    ) -> str:
        """
        Resolve a logical resource name to its database column.
        """

        column = USAGE_COLUMNS.get(
            resource
        )

        if column is None:
            raise ValueError(
                f"Unknown usage resource: {resource}"
            )

        return column

    # ============================================================
    # CHECK LIMIT
    # ============================================================

    def check_limit(
        self,
        user: dict,
        resource: str,
    ):
        """
        Check whether the user can perform an operation.

        This method DOES NOT consume usage.
        """

        column = self._get_usage_column(
            resource
        )

        user_id = user.get(
            "auth_user_id"
        )

        if not user_id:
            raise ValueError(
                "User is missing auth_user_id."
            )

        plan = self._get_plan(
            user
        )

        usage = self._get_or_create_usage(
            user_id
        )

        usage = self._reset_if_new_month(
            usage
        )

        current_usage = max(
            int(
                usage.get(
                    column,
                    0,
                ) or 0
            ),
            0,
        )

        limit = PLAN_LIMITS[plan][
            resource
        ]

        remaining = max(
            limit - current_usage,
            0,
        )

        if current_usage >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "usage_limit_reached",
                    "resource": resource,
                    "plan": plan,
                    "limit": limit,
                    "used": current_usage,
                    "remaining": 0,
                },
            )

        return {
            "allowed": True,
            "plan": plan,
            "resource": resource,
            "used": current_usage,
            "limit": limit,
            "remaining": remaining,
        }

    # ============================================================
    # CONSUME
    # ============================================================

    def consume(
        self,
        user: dict,
        resource: str,
        amount: int = 1,
    ):
        """
        Consume usage after a successful operation.

        The limit is checked AGAIN here.

        This is intentional: callers should not be able to
        accidentally bypass limits simply by calling consume()
        without first calling check_limit().
        """

        column = self._get_usage_column(
            resource
        )

        if amount < 1:
            raise ValueError(
                "Usage amount must be at least 1."
            )

        user_id = user.get(
            "auth_user_id"
        )

        if not user_id:
            raise ValueError(
                "User is missing auth_user_id."
            )

        plan = self._get_plan(
            user
        )

        usage = self._get_or_create_usage(
            user_id
        )

        usage = self._reset_if_new_month(
            usage
        )

        current_usage = max(
            int(
                usage.get(
                    column,
                    0,
                ) or 0
            ),
            0,
        )

        limit = PLAN_LIMITS[plan][
            resource
        ]

        if current_usage + amount > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "usage_limit_reached",
                    "resource": resource,
                    "plan": plan,
                    "limit": limit,
                    "used": current_usage,
                    "remaining": max(
                        limit - current_usage,
                        0,
                    ),
                },
            )

        return usage_repository.update_usage(
            user_id,
            {
                column: current_usage + amount,
                "updated_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            },
        )

    # ============================================================
    # AI USAGE
    # ============================================================

    def record_ai_usage(
        self,
        user: dict,
        requests: int = 1,
        tokens: int = 0,
    ):
        """
        Record actual AI consumption.

        AI usage is accounting/observability data.
        It is separate from feature-level limits.
        """

        if requests < 0:
            raise ValueError(
                "AI requests cannot be negative."
            )

        if tokens < 0:
            raise ValueError(
                "AI tokens cannot be negative."
            )

        if requests == 0 and tokens == 0:
            return self._get_or_create_usage(
                user["auth_user_id"]
            )

        user_id = user.get(
            "auth_user_id"
        )

        if not user_id:
            raise ValueError(
                "User is missing auth_user_id."
            )

        usage = self._get_or_create_usage(
            user_id
        )

        usage = self._reset_if_new_month(
            usage
        )

        current_requests = max(
            int(
                usage.get(
                    "ai_requests_used",
                    0,
                ) or 0
            ),
            0,
        )

        current_tokens = max(
            int(
                usage.get(
                    "ai_tokens_used",
                    0,
                ) or 0
            ),
            0,
        )

        return usage_repository.update_usage(
            user_id,
            {
                "ai_requests_used": (
                    current_requests + requests
                ),
                "ai_tokens_used": (
                    current_tokens + tokens
                ),
                "updated_at": datetime.now(
                    timezone.utc
                ).isoformat(),
            },
        )

    # ============================================================
    # USAGE STATUS
    # ============================================================

    def get_usage_status(
        self,
        user: dict,
    ):
        """
        Return the complete usage status for the current period.
        """

        user_id = user.get(
            "auth_user_id"
        )

        if not user_id:
            raise ValueError(
                "User is missing auth_user_id."
            )

        plan = self._get_plan(
            user
        )

        usage = self._get_or_create_usage(
            user_id
        )

        usage = self._reset_if_new_month(
            usage
        )

        usage_status = {}

        for resource, column in USAGE_COLUMNS.items():

            used = max(
                int(
                    usage.get(
                        column,
                        0,
                    ) or 0
                ),
                0,
            )

            limit = PLAN_LIMITS[plan][
                resource
            ]

            usage_status[resource] = {
                "used": used,
                "limit": limit,
                "remaining": max(
                    limit - used,
                    0,
                ),
            }

        return {
            "plan": plan,
            "usage": usage_status,
            "ai": {
                "requests_used": max(
                    int(
                        usage.get(
                            "ai_requests_used",
                            0,
                        ) or 0
                    ),
                    0,
                ),
                "tokens_used": max(
                    int(
                        usage.get(
                            "ai_tokens_used",
                            0,
                        ) or 0
                    ),
                    0,
                ),
            },
            "period_start": usage[
                "usage_period_start"
            ],
        }


usage_service = UsageService()