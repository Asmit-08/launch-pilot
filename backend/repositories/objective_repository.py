from datetime import datetime, timezone
import time

import httpx
from supabase import Client


class ObjectiveRepository:

    VALID_STATUSES = {
        "active",
        "completed",
        "failed",
        "skipped",
        "expired",
    }

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

        Only read operations should use this helper.

        Writes are intentionally not retried automatically because
        retrying a mutation can create duplicate records or apply
        the same state transition more than once.
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

    @classmethod
    def _validate_status(cls, status: str):
        """
        Validate an objective status.
        """

        if status not in cls.VALID_STATUSES:
            raise ValueError(
                f"Invalid objective status: {status}. "
                f"Expected one of: {sorted(cls.VALID_STATUSES)}"
            )

    # =========================================================
    # CREATE
    # =========================================================

    def create_objective(
        self,
        project_id: str,
        constraint_belief_id: str,
        text: str,
        action: str,
        target_count: int,
        evidence_kind: str,
        success_criteria: str,
        failure_criteria: str,
        do_not_do: str,
        due_at: str | None = None,
    ):
        """
        Create a new active objective for a project.

        Objective creation should normally be controlled by
        the decision engine.

        Database-level protection should enforce that a project
        cannot have more than one active objective.
        """

        if not project_id:
            raise ValueError("project_id is required.")

        if not constraint_belief_id:
            raise ValueError(
                "constraint_belief_id is required."
            )

        if not text or not text.strip():
            raise ValueError(
                "Objective text cannot be empty."
            )

        if not action or not action.strip():
            raise ValueError(
                "Objective action cannot be empty."
            )

        if target_count < 1:
            raise ValueError(
                "Objective target_count must be at least 1."
            )

        if not evidence_kind or not evidence_kind.strip():
            raise ValueError(
                "Objective evidence_kind cannot be empty."
            )

        response = (
            self.client
            .table("project_objectives")
            .insert({
                "project_id": project_id,
                "constraint_belief_id": constraint_belief_id,
                "text": text.strip(),
                "action": action.strip(),
                "target_count": target_count,
                "evidence_kind": evidence_kind.strip(),
                "success_criteria": success_criteria,
                "failure_criteria": failure_criteria,
                "do_not_do": do_not_do,
                "status": "active",
                "due_at": due_at,
            })
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create objective."
            )

        return response.data[0]

    # =========================================================
    # READ
    # =========================================================

    def get_objective(
        self,
        objective_id: str,
        project_id: str,
    ):
        """
        Get one objective belonging to a specific project.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("id", objective_id)
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_objectives(
        self,
        project_id: str,
    ):
        """
        Get all objectives belonging to a project.

        Newest objectives are returned first.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_active_objective(
        self,
        project_id: str,
    ):
        """
        Get the current active objective for a project.

        V2 is designed around one active objective at a time.

        The database should additionally enforce this invariant
        with a partial unique index.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_objectives_by_status(
        self,
        project_id: str,
        status: str,
    ):
        """
        Get project objectives filtered by status.
        """

        self._validate_status(status)

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .eq("status", status)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    def get_objectives_for_belief(
        self,
        project_id: str,
        belief_id: str,
    ):
        """
        Get objectives created to test a specific belief.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .eq("constraint_belief_id", belief_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    # =========================================================
    # UPDATE
    # =========================================================

    def update_objective(
        self,
        objective_id: str,
        project_id: str,
        updates: dict,
    ):
        """
        Update an existing objective.

        The decision engine determines what changes.
        This repository persists those changes.

        Status transitions should preferably use update_status()
        so completed_at remains consistent.
        """

        if not updates:
            raise ValueError(
                "Objective updates cannot be empty."
            )

        # Prevent accidental status/completion timestamp
        # inconsistencies when using the generic update method.
        if "status" in updates:
            self._validate_status(updates["status"])

            if updates["status"] == "active":
                updates = {
                    **updates,
                    "completed_at": None,
                }

            elif "completed_at" not in updates:
                updates = {
                    **updates,
                    "completed_at": (
                        datetime.now(timezone.utc).isoformat()
                    ),
                }

        response = (
            self.client
            .table("project_objectives")
            .update(updates)
            .eq("id", objective_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # =========================================================
    # STATUS
    # =========================================================

    def update_status(
        self,
        objective_id: str,
        project_id: str,
        status: str,
    ):
        """
        Update objective status while keeping completed_at
        consistent with the status.
        """

        self._validate_status(status)

        if status == "active":
            completed_at = None
        else:
            completed_at = (
                datetime.now(timezone.utc).isoformat()
            )

        response = (
            self.client
            .table("project_objectives")
            .update({
                "status": status,
                "completed_at": completed_at,
            })
            .eq("id", objective_id)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # =========================================================
    # COMPLETION
    # =========================================================

    def complete_objective(
        self,
        objective_id: str,
        project_id: str,
    ):
        """
        Mark an objective as completed.
        """

        return self.update_status(
            objective_id=objective_id,
            project_id=project_id,
            status="completed",
        )

    def fail_objective(
        self,
        objective_id: str,
        project_id: str,
    ):
        """
        Mark an objective as failed.
        """

        return self.update_status(
            objective_id=objective_id,
            project_id=project_id,
            status="failed",
        )

    def skip_objective(
        self,
        objective_id: str,
        project_id: str,
    ):
        """
        Mark an objective as skipped.
        """

        return self.update_status(
            objective_id=objective_id,
            project_id=project_id,
            status="skipped",
        )

    def expire_objective(
        self,
        objective_id: str,
        project_id: str,
    ):
        """
        Mark an objective as expired.
        """

        return self.update_status(
            objective_id=objective_id,
            project_id=project_id,
            status="expired",
        )

    # =========================================================
    # DUE OBJECTIVES
    # =========================================================

    def get_due_objectives(
        self,
        project_id: str,
        due_at: str,
    ):
        """
        Get active objectives whose due time has passed.

        Objectives without a due_at value are excluded.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .eq("status", "active")
            .not_.is_("due_at", "null")
            .lte("due_at", due_at)
            .order("due_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data