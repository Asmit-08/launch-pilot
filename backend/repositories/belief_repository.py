import time

import httpx
from supabase import Client


class BeliefRepository:

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

    # ---------------- Create ---------------- #

    def create_belief(
        self,
        project_id: str,
        claim: str,
        belief_type: str,
        status: str = "untested",
        confidence: int = 0,
    ):
        """
        Create a new belief for a project.
        """

        response = (
            self.client
            .table("beliefs")
            .insert({
                "project_id": project_id,
                "claim": claim,
                "type": belief_type,
                "status": status,
                "confidence": confidence,
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read ---------------- #

    def get_belief(
        self,
        belief_id: str,
        project_id: str,
    ):
        """
        Get one belief belonging to a specific project.
        """

        query = (
            self.client
            .table("beliefs")
            .select("*")
            .eq("id", belief_id)
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_beliefs(
        self,
        project_id: str,
    ):
        """
        Get all beliefs belonging to a project.
        """

        query = (
            self.client
            .table("beliefs")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_active_beliefs(
        self,
        project_id: str,
    ):
        """
        Get beliefs that have not been retired.
        """

        query = (
            self.client
            .table("beliefs")
            .select("*")
            .eq("project_id", project_id)
            .neq("status", "retired")
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_unresolved_beliefs(
        self,
        project_id: str,
    ):
        """
        Get beliefs that are not currently resolved/supported.

        These are candidates for constraint selection.
        """

        query = (
            self.client
            .table("beliefs")
            .select("*")
            .eq("project_id", project_id)
            .in_(
                "status",
                [
                    "untested",
                    "weak",
                    "contradicted",
                ],
            )
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Update ---------------- #

    def update_belief(
        self,
        belief_id: str,
        project_id: str,
        updates: dict,
    ):
        """
        Update an existing belief.

        The decision engine determines what changes.
        This repository only persists them.
        """

        response = (
            self.client
            .table("beliefs")
            .update(updates)
            .eq("id", belief_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # ---------------- Status / Confidence ---------------- #

    def update_status(
        self,
        belief_id: str,
        project_id: str,
        status: str,
    ):
        """
        Update belief status.
        """

        response = (
            self.client
            .table("beliefs")
            .update({
                "status": status,
            })
            .eq("id", belief_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def update_confidence(
        self,
        belief_id: str,
        project_id: str,
        confidence: int,
    ):
        """
        Update belief confidence.

        Confidence is intentionally restricted to 0–3.
        """

        if confidence not in (0, 1, 2, 3):
            raise ValueError(
                "Belief confidence must be between 0 and 3."
            )

        response = (
            self.client
            .table("beliefs")
            .update({
                "confidence": confidence,
            })
            .eq("id", belief_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]