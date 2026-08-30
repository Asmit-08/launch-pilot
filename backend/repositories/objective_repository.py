from datetime import datetime, timezone
import time

import httpx
from supabase import Client


class ObjectiveRepository:

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
        Create a new objective for a project.

        Objective creation should normally be controlled
        by the decision engine.
        """

        if target_count < 1:
            raise ValueError(
                "Objective target_count must be at least 1."
            )

        response = (
            self.client
            .table("project_objectives")
            .insert({
                "project_id": project_id,
                "constraint_belief_id": constraint_belief_id,
                "text": text,
                "action": action,
                "target_count": target_count,
                "evidence_kind": evidence_kind,
                "success_criteria": success_criteria,
                "failure_criteria": failure_criteria,
                "do_not_do": do_not_do,
                "status": "active",
                "due_at": due_at,
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read ---------------- #

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
        Get the single active objective for a project.

        V2 allows only one active objective at a time.
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

        valid_statuses = {
            "active",
            "completed",
            "failed",
            "skipped",
            "expired",
        }

        if status not in valid_statuses:
            raise ValueError(
                f"Invalid objective status: {status}"
            )

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

    # ---------------- Update ---------------- #

    def update_objective(
        self,
        objective_id: str,
        project_id: str,
        updates: dict,
    ):
        """
        Update an objective.

        Decision logic determines what changes.
        This repository only persists those changes.
        """

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

    # ---------------- Status ---------------- #

    def update_status(
        self,
        objective_id: str,
        project_id: str,
        status: str,
    ):
        """
        Update objective status.
        """

        valid_statuses = {
            "active",
            "completed",
            "failed",
            "skipped",
            "expired",
        }

        if status not in valid_statuses:
            raise ValueError(
                f"Invalid objective status: {status}"
            )

        updates = {
            "status": status,
        }

        if status == "active":
            updates["completed_at"] = None
        else:
            updates["completed_at"] = (
                datetime.now(timezone.utc).isoformat()
            )

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

    # ---------------- Completion ---------------- #

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

    # ---------------- Due Objectives ---------------- #

    def get_due_objectives(
        self,
        project_id: str,
        due_at: str,
    ):
        """
        Get active objectives whose due time has passed.
        """

        query = (
            self.client
            .table("project_objectives")
            .select("*")
            .eq("project_id", project_id)
            .eq("status", "active")
            .lte("due_at", due_at)
            .order("due_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data