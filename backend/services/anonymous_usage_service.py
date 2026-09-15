from datetime import date
from hashlib import sha256
import os
from typing import Any, cast

from fastapi import HTTPException, Request

from database.supabase_fetcher import supabase


ANONYMOUS_PLAN_LIMITS: dict[str, int] = {
    "landing_page_analyses": 2,
    "personas": 2,
}

IDENTIFIER_SALT = os.getenv(
    "ANONYMOUS_USAGE_SALT",
)


class AnonymousUsageService:
    """
    Persistent anonymous usage limiter for public features.

    Anonymous usage is stored separately from authenticated user usage.
    The client IP is combined with a server-side salt and hashed before
    being stored.
    """

    def _get_client_identifier(
        self,
        request: Request,
    ) -> str:
        client_host = (
            request.client.host
            if request.client
            else None
        )

        if not client_host:
            raise HTTPException(
                status_code=400,
                detail="Unable to identify the client.",
            )

        if not IDENTIFIER_SALT:
            raise RuntimeError(
                "ANONYMOUS_USAGE_SALT is not configured."
            )

        raw_identifier = (
            f"{IDENTIFIER_SALT}:{client_host}"
        )

        return sha256(
            raw_identifier.encode("utf-8")
        ).hexdigest()

    def _get_limit(
        self,
        resource: str,
    ) -> int:
        limit = ANONYMOUS_PLAN_LIMITS.get(resource)

        if limit is None:
            raise ValueError(
                f"Unsupported anonymous resource: {resource}"
            )

        return limit

    def _get_usage_column(
        self,
        resource: str,
    ) -> str:
        usage_columns: dict[str, str] = {
            "landing_page_analyses": (
                "landing_page_analyses_used"
            ),
            "personas": "personas_used",
        }

        column = usage_columns.get(resource)

        if column is None:
            raise ValueError(
                f"Unsupported anonymous resource: {resource}"
            )

        return column

    def _get_usage_record(
        self,
        request: Request,
    ) -> dict[str, Any] | None:
        identifier_hash = self._get_client_identifier(
            request
        )

        usage_period_start = (
            date.today().replace(day=1)
        )

        response = (
            supabase.table("anonymous_usage")
            .select("*")
            .eq(
                "identifier_hash",
                identifier_hash,
            )
            .eq(
                "usage_period_start",
                usage_period_start.isoformat(),
            )
            .limit(1)
            .execute()
        )

        records = cast(
            list[dict[str, Any]],
            response.data,
        )

        if not records:
            return None

        return records[0]

    def _ensure_usage_record(
        self,
        request: Request,
    ) -> dict[str, Any]:
        existing = self._get_usage_record(request)

        if existing is not None:
            return existing

        identifier_hash = self._get_client_identifier(
            request
        )

        usage_period_start = (
            date.today().replace(day=1)
        )

        response = (
            supabase.table("anonymous_usage")
            .insert(
                {
                    "identifier_hash": identifier_hash,
                    "usage_period_start": (
                        usage_period_start.isoformat()
                    ),
                }
            )
            .execute()
        )

        records = cast(
            list[dict[str, Any]],
            response.data,
        )

        if records:
            return records[0]

        # Handle a possible race where another request
        # created the record between SELECT and INSERT.
        existing = self._get_usage_record(request)

        if existing is not None:
            return existing

        raise RuntimeError(
            "Failed to create anonymous usage record."
        )

    def _get_used(
        self,
        usage_record: dict[str, Any] | None,
        usage_column: str,
    ) -> int:
        if usage_record is None:
            return 0

        raw_value = usage_record.get(
            usage_column,
            0,
        )

        if isinstance(raw_value, int):
            return raw_value

        if isinstance(raw_value, float):
            return int(raw_value)

        return 0

    def check_limit(
        self,
        request: Request,
        resource: str,
    ) -> None:
        limit = self._get_limit(resource)

        usage_column = self._get_usage_column(
            resource
        )

        usage_record = self._get_usage_record(
            request
        )

        used = self._get_used(
            usage_record,
            usage_column,
        )

        if used >= limit:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "usage_limit_reached",
                    "resource": resource,
                    "plan": "free",
                    "limit": limit,
                    "used": used,
                    "remaining": 0,
                },
            )

    def consume(
        self,
        request: Request,
        resource: str,
    ) -> None:
        self.check_limit(
            request,
            resource,
        )

        usage_record = self._ensure_usage_record(
            request
        )

        usage_column = self._get_usage_column(
            resource
        )

        current_usage = self._get_used(
            usage_record,
            usage_column,
        )

        updated_usage = current_usage + 1

        identifier_hash = self._get_client_identifier(
            request
        )

        usage_period_start = (
            date.today().replace(day=1)
        )

        response = (
            supabase.table("anonymous_usage")
            .update(
                {
                    usage_column: updated_usage,
                    "updated_at": (
                        "now()"
                    ),
                }
            )
            .eq(
                "identifier_hash",
                identifier_hash,
            )
            .eq(
                "usage_period_start",
                usage_period_start.isoformat(),
            )
            .execute()
        )

        records = cast(
            list[dict[str, Any]],
            response.data,
        )

        if not records:
            raise RuntimeError(
                "Failed to update anonymous usage."
            )


anonymous_usage_service = AnonymousUsageService()