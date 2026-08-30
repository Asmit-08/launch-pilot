import time

import httpx
from supabase import Client


class StateEventRepository:

    def __init__(self, client: Client):
        self.client = client

    # ---------------- Internal Helpers ---------------- #

    def _execute_with_retry(
        self,
        query,
        retries: int = 2,
        delay: float = 0.3,
    ):
        """
        Execute a Supabase read query with limited retry handling.

        Reads are safe to retry because they do not mutate state.
        """

        for attempt in range(retries + 1):

            try:
                return query.execute()

            except (
                httpx.ReadError,
                httpx.ConnectError,
                httpx.RemoteProtocolError,
            ) as e:

                if attempt >= retries:
                    raise

                print(
                    f"Supabase read failed "
                    f"(attempt {attempt + 1}/{retries + 1}): {e}"
                )

                time.sleep(delay * (attempt + 1))

    # ---------------- Create Event ---------------- #

    def create_event(
        self,
        project_id: str,
        event_type: str,
        payload: dict | None = None,
    ):
        """
        Append a new immutable state event.

        Historical events must never be updated or overwritten.
        """

        valid_event_types = {
            "objective_set",
            "outcome_logged",
            "belief_updated",
            "constraint_changed",
            "decision_made",
            "objective_overridden",
        }

        if event_type not in valid_event_types:
            raise ValueError(
                f"Invalid state event type: {event_type}"
            )

        response = (
            self.client
            .table("state_events")
            .insert({
                "project_id": project_id,
                "type": event_type,
                "payload": payload or {},
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read ---------------- #

    def get_event(
        self,
        event_id: str,
        project_id: str,
    ):
        """
        Get one event belonging to a specific project.
        """

        query = (
            self.client
            .table("state_events")
            .select("*")
            .eq("id", event_id)
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_events(
        self,
        project_id: str,
    ):
        """
        Get the complete chronological event history
        for a project.
        """

        query = (
            self.client
            .table("state_events")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Event Type ---------------- #

    def get_events_by_type(
        self,
        project_id: str,
        event_type: str,
    ):
        """
        Get project events filtered by event type.
        """

        valid_event_types = {
            "objective_set",
            "outcome_logged",
            "belief_updated",
            "constraint_changed",
            "decision_made",
            "objective_overridden",
        }

        if event_type not in valid_event_types:
            raise ValueError(
                f"Invalid state event type: {event_type}"
            )

        query = (
            self.client
            .table("state_events")
            .select("*")
            .eq("project_id", project_id)
            .eq("type", event_type)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Recent Events ---------------- #

    def get_recent_events(
        self,
        project_id: str,
        limit: int = 20,
    ):
        """
        Get the most recent events for a project.

        Useful for the daily decision loop.
        """

        if limit < 1:
            raise ValueError(
                "Event limit must be at least 1."
            )

        query = (
            self.client
            .table("state_events")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(limit)
        )

        response = self._execute_with_retry(query)

        return response.data