import time

import httpx
from supabase import Client


class StartupStateRepository:

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

    # ---------------- Startup State ---------------- #

    def get_state(
        self,
        project_id: str,
    ):
        """
        Get the authoritative startup state for a project.
        """

        query = (
            self.client
            .table("project_state")
            .select("*")
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def create_state(
        self,
        project_id: str,
        stage: str,
        one_liner: str,
    ):
        """
        Create the initial startup state for a project.
        """

        response = (
            self.client
            .table("project_state")
            .insert({
                "project_id": project_id,
                "stage": stage,
                "one_liner": one_liner,
                "current_constraint_belief_id": None,
                "why_this_constraint": None,
                "active_objective_id": None,
                "active_experiment_id": None,
            })
            .execute()
        )

        return response.data[0]

    def update_state(
        self,
        project_id: str,
        updates: dict,
    ):
        """
        Persist changes to the authoritative startup state.

        The decision engine determines WHAT changes.
        This repository only persists those changes.
        """

        response = (
            self.client
            .table("project_state")
            .update(updates)
            .eq("project_id", project_id)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # ---------------- Constraint ---------------- #

    def set_constraint(
        self,
        project_id: str,
        belief_id: str | None,
        why_this_constraint: str | None = None,
    ):
        """
        Set or clear the current startup constraint.
        """

        return self.update_state(
            project_id,
            {
                "current_constraint_belief_id": belief_id,
                "why_this_constraint": why_this_constraint,
            },
        )

    # ---------------- Active Objective ---------------- #

    def set_active_objective(
        self,
        project_id: str,
        objective_id: str | None,
    ):
        """
        Set or clear the active objective.

        There should only ever be one active objective.
        """

        return self.update_state(
            project_id,
            {
                "active_objective_id": objective_id,
            },
        )

    # ---------------- Stage ---------------- #

    def update_stage(
        self,
        project_id: str,
        stage: str,
    ):
        """
        Update the project's current operating stage.
        """

        return self.update_state(
            project_id,
            {
                "stage": stage,
            },
        )

    # ---------------- One Liner ---------------- #

    def update_one_liner(
        self,
        project_id: str,
        one_liner: str,
    ):
        """
        Update the canonical startup one-liner.
        """

        return self.update_state(
            project_id,
            {
                "one_liner": one_liner,
            },
        )