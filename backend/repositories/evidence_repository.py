import time

import httpx
from supabase import Client


class EvidenceRepository:

    # =========================================================
    # CONSTANTS
    # =========================================================

    VALID_QUALITIES = {
        "anecdote",
        "repeated",
        "behavioral",
        "paid",
    }

    # =========================================================
    # INITIALIZATION
    # =========================================================

    def __init__(self, client: Client):
        self.client = client

    # =========================================================
    # INTERNAL HELPERS
    # =========================================================

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

    # =========================================================
    # CREATE
    # =========================================================

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

        Every evidence record belongs to the specific objective
        against which it was collected.

        This repository persists evidence only.
        Interpretation belongs to DecisionService.
        """

        # -----------------------------------------------------
        # Validate project
        # -----------------------------------------------------

        if not isinstance(project_id, str) or not project_id.strip():
            raise ValueError(
                "project_id cannot be empty."
            )

        # -----------------------------------------------------
        # Validate objective
        # -----------------------------------------------------

        if (
            not isinstance(objective_id, str)
            or not objective_id.strip()
        ):
            raise ValueError(
                "objective_id cannot be empty."
            )

        # -----------------------------------------------------
        # Validate evidence kind
        # -----------------------------------------------------

        if not isinstance(kind, str) or not kind.strip():
            raise ValueError(
                "Evidence kind cannot be empty."
            )

        # -----------------------------------------------------
        # Validate source
        # -----------------------------------------------------

        if not isinstance(source, str) or not source.strip():
            raise ValueError(
                "Evidence source cannot be empty."
            )

        # -----------------------------------------------------
        # Validate observation
        # -----------------------------------------------------

        if (
            not isinstance(observed, str)
            or not observed.strip()
        ):
            raise ValueError(
                "Observed evidence cannot be empty."
            )

        # -----------------------------------------------------
        # Validate quality
        # -----------------------------------------------------

        if quality not in self.VALID_QUALITIES:
            raise ValueError(
                "Invalid evidence quality. "
                f"Expected one of: "
                f"{sorted(self.VALID_QUALITIES)}"
            )

        # -----------------------------------------------------
        # Validate evidence count
        # -----------------------------------------------------

        if not isinstance(n, int) or isinstance(n, bool):
            raise ValueError(
                "Evidence count 'n' must be an integer."
            )

        if n < 1:
            raise ValueError(
                "Evidence count 'n' must be at least 1."
            )

        # -----------------------------------------------------
        # Insert
        # -----------------------------------------------------

        response = (
            self.client
            .table("evidence")
            .insert({
                "project_id": project_id,
                "objective_id": objective_id,
                "kind": kind.strip(),
                "source": source.strip(),
                "n": n,
                "observed": observed.strip(),
                "quality": quality,
            })
            .execute()
        )

        # -----------------------------------------------------
        # Validate response
        # -----------------------------------------------------

        if not response.data:
            raise RuntimeError(
                "Evidence insert succeeded but returned no data."
            )

        return response.data[0]

    # =========================================================
    # READ
    # =========================================================

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

    # =========================================================
    # PROJECT EVIDENCE
    # =========================================================

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

    # =========================================================
    # OBJECTIVE EVIDENCE
    # =========================================================

    def get_objective_evidence(
        self,
        project_id: str,
        objective_id: str,
    ):
        """
        Get all evidence collected specifically for one
        objective.

        This is the authoritative source for calculating
        objective progress.
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

    # =========================================================
    # EVIDENCE BY KIND
    # =========================================================

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

    # =========================================================
    # OBJECTIVE EVIDENCE BY KIND
    # =========================================================

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

    # =========================================================
    # UPDATE
    # =========================================================

    def update_evidence(
        self,
        evidence_id: str,
        project_id: str,
        updates: dict,
    ):
        """
        Update an evidence record.

        Evidence interpretation belongs to the decision engine.
        This repository only persists supplied changes.
        """

        if not isinstance(updates, dict) or not updates:
            raise ValueError(
                "Evidence updates cannot be empty."
            )

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

    # =========================================================
    # EVIDENCE BY QUALITY
    # =========================================================

    def get_evidence_by_quality(
        self,
        project_id: str,
        quality: str,
    ):
        """
        Get project evidence filtered by evidence quality.

        Supported qualities:

            anecdote
            repeated
            behavioral
            paid
        """

        if quality not in self.VALID_QUALITIES:
            raise ValueError(
                "Invalid evidence quality. "
                f"Expected one of: "
                f"{sorted(self.VALID_QUALITIES)}"
            )

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

    # =========================================================
    # OBJECTIVE EVIDENCE BY QUALITY
    # =========================================================

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

        if quality not in self.VALID_QUALITIES:
            raise ValueError(
                "Invalid evidence quality. "
                f"Expected one of: "
                f"{sorted(self.VALID_QUALITIES)}"
            )

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