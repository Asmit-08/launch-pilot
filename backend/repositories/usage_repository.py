import time

import httpx
from supabase import Client


class UsageRepository:

    def __init__(self, client: Client):
        self.client = client

    # ============================================================
    # INTERNAL HELPERS
    # ============================================================

    def _execute_with_retry(
        self,
        query,
        retries: int = 2,
        delay: float = 0.3,
    ):
        """
        Execute a Supabase read query with limited retry handling.

        Only read operations should use this helper.
        Mutations are intentionally NOT retried automatically.
        """

        for attempt in range(retries + 1):

            try:
                return query.execute()

            except (
                httpx.ReadError,
                httpx.ConnectError,
                httpx.RemoteProtocolError,
            ) as exc:

                if attempt >= retries:
                    raise

                print(
                    f"Supabase usage read failed "
                    f"(attempt {attempt + 1}/{retries + 1}): {exc}"
                )

                time.sleep(delay * (attempt + 1))

    # ============================================================
    # READ
    # ============================================================

    def get_usage(self, user_id: str):
        """
        Get the usage record for a user.

        There should be exactly one usage row per user.
        """

        query = (
            self.client
            .table("user_usage")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    # ============================================================
    # CREATE
    # ============================================================

    def create_usage(self, user_id: str):
        """
        Create the initial usage record for a user.

        Database defaults are responsible for:
            audits_used
            chat_messages_used
            personas_used
            landing_page_analyses_used
            ai_requests_used
            ai_tokens_used
            usage_period_start
            created_at
            updated_at
        """

        response = (
            self.client
            .table("user_usage")
            .insert({
                "user_id": user_id,
            })
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create usage record."
            )

        return response.data[0]

    # ============================================================
    # UPDATE
    # ============================================================

    def update_usage(
        self,
        user_id: str,
        updates: dict,
    ):
        """
        Update an existing usage record.

        The service layer determines what is allowed to change.
        """

        if not updates:
            raise ValueError(
                "Usage update cannot be empty."
            )

        response = (
            self.client
            .table("user_usage")
            .update(updates)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]