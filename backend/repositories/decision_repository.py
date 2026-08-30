import time

import httpx
from supabase import Client


class DecisionRepository:

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

    def create_decision(
        self,
        project_id: str,
        decision_type: str,
        from_belief_id: str | None = None,
        to_belief_id: str | None = None,
        evidence_ids: list[str] | None = None,
        human_override: bool = False,
        override_note: str | None = None,
    ):
        """
        Create an append-only decision record.

        Decisions are historical records and should never be
        overwritten by the decision engine.
        """

        valid_types = {
            "continue",
            "investigate",
            "stop_doing",
            "change_constraint",
            "stage_up",
            "pivot_claim",
        }

        if decision_type not in valid_types:
            raise ValueError(
                f"Invalid decision type: {decision_type}"
            )

        if human_override and not override_note:
            raise ValueError(
                "override_note is required when human_override is True."
            )

        response = (
            self.client
            .table("decisions")
            .insert({
                "project_id": project_id,
                "type": decision_type,
                "from_belief_id": from_belief_id,
                "to_belief_id": to_belief_id,
                "evidence_ids": evidence_ids or [],
                "human_override": human_override,
                "override_note": override_note,
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read ---------------- #

    def get_decision(
        self,
        decision_id: str,
        project_id: str,
    ):
        """
        Get one decision belonging to a specific project.
        """

        query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("id", decision_id)
            .eq("project_id", project_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_decisions(
        self,
        project_id: str,
    ):
        """
        Get all decisions for a project.

        Decisions are append-only, so this returns the
        historical decision trail.
        """

        query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Decision Type ---------------- #

    def get_decisions_by_type(
        self,
        project_id: str,
        decision_type: str,
    ):
        """
        Get decisions filtered by decision type.
        """

        valid_types = {
            "continue",
            "investigate",
            "stop_doing",
            "change_constraint",
            "stage_up",
            "pivot_claim",
        }

        if decision_type not in valid_types:
            raise ValueError(
                f"Invalid decision type: {decision_type}"
            )

        query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .eq("type", decision_type)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Belief History ---------------- #

    def get_decisions_for_belief(
        self,
        project_id: str,
        belief_id: str,
    ):
        """
        Get all decisions involving a specific belief.

        A belief can appear as either the previous belief
        (from_belief_id) or the resulting belief
        (to_belief_id).
        """

        from_query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .eq("from_belief_id", belief_id)
            .order("created_at", desc=False)
        )

        to_query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .eq("to_belief_id", belief_id)
            .order("created_at", desc=False)
        )

        from_response = self._execute_with_retry(from_query)
        to_response = self._execute_with_retry(to_query)

        decisions = (
            from_response.data +
            to_response.data
        )

        decisions.sort(
            key=lambda decision: decision.get("created_at", "")
        )

        return decisions

    # ---------------- Evidence History ---------------- #

    def get_decisions_for_evidence(
        self,
        project_id: str,
        evidence_id: str,
    ):
        """
        Get decisions that used a particular evidence record.
        """

        query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .contains("evidence_ids", [evidence_id])
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Human Overrides ---------------- #

    def get_human_overrides(
        self,
        project_id: str,
    ):
        """
        Get all decisions where the founder explicitly
        overrode the system decision.
        """

        query = (
            self.client
            .table("decisions")
            .select("*")
            .eq("project_id", project_id)
            .eq("human_override", True)
            .order("created_at", desc=False)
        )

        response = self._execute_with_retry(query)

        return response.data