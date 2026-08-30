import time

import httpx
from supabase import Client


class EvidenceRepository:

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

    # ---------------- Create ---------------- #

    def create_evidence(
        self,
        project_id: str,
        objective_id: str,
        kind: str,
        source: str,
        observed: str,
        quality: str,
        n: int = 1,
    ):
        """
        Create a new evidence record.

        Every evidence record must belong to the specific
        objective against which it was collected.
        """

        if n < 1:
            raise ValueError(
                "Evidence count 'n' must be at least 1."
            )

        response = (
            self.client
            .table("evidence")
            .insert({
                "project_id": project_id,
                "objective_id": objective_id,
                "kind": kind,
                "source": source,
                "n": n,
                "observed": observed,
                "quality": quality,
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read ---------------- #

    def get_evidence(
        self,
        evidence_id: str,
        project_id: str,
    ):
        """
        Get one evidence record belonging to a specific project.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("id", evidence_id)
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_project_evidence(
        self,
        project_id: str,
    ):
        """
        Get all evidence belonging to a project.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_objective_evidence(
        self,
        project_id: str,
        objective_id: str,
    ):
        """
        Get all evidence collected specifically for
        one objective.

        This is the authoritative source for calculating
        objective evidence progress.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .eq("objective_id", objective_id)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_evidence_by_kind(
        self,
        project_id: str,
        kind: str,
    ):
        """
        Get project evidence filtered by evidence kind.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .eq("kind", kind)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_objective_evidence_by_kind(
        self,
        project_id: str,
        objective_id: str,
        kind: str,
    ):
        """
        Get evidence for a specific objective filtered
        by evidence kind.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .eq("objective_id", objective_id)
            .eq("kind", kind)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Update ---------------- #

    def update_evidence(
        self,
        evidence_id: str,
        project_id: str,
        updates: dict,
    ):
        """
        Update an evidence record.

        Evidence interpretation belongs to the decision engine.
        This repository only persists the supplied changes.
        """

        response = (
            self.client
            .table("evidence")
            .update(updates)
            .eq("id", evidence_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # ---------------- Evidence Quality ---------------- #

    def get_evidence_by_quality(
        self,
        project_id: str,
        quality: str,
    ):
        """
        Get project evidence filtered by evidence quality.

        Examples:
        anecdote
        repeated
        behavioral
        paid
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .eq("quality", quality)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_objective_evidence_by_quality(
        self,
        project_id: str,
        objective_id: str,
        quality: str,
    ):
        """
        Get evidence for a specific objective filtered
        by evidence quality.
        """

        query = (
            self.client
            .table("evidence")
            .select("*")
            .eq("project_id", project_id)
            .eq("objective_id", objective_id)
            .eq("quality", quality)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

