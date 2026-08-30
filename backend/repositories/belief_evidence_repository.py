import time

import httpx
from supabase import Client


class BeliefEvidenceRepository:

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

    # ---------------- Create Relationship ---------------- #

    def link_evidence_to_belief(
        self,
        belief_id: str,
        evidence_id: str,
        relationship: str,
    ):
        """
        Link evidence to a belief.

        relationship should describe whether the evidence:
        - supports the belief
        - contradicts the belief
        """

        if relationship not in ("supports", "contradicts"):
            raise ValueError(
                "Relationship must be 'supports' or 'contradicts'."
            )

        response = (
            self.client
            .table("belief_evidence")
            .insert({
                "belief_id": belief_id,
                "evidence_id": evidence_id,
                "relationship": relationship,
            })
            .execute()
        )

        return response.data[0]

    # ---------------- Read: Belief → Evidence ---------------- #

    def get_evidence_for_belief(
        self,
        belief_id: str,
    ):
        """
        Get all evidence linked to a belief.
        """

        query = (
            self.client
            .table("belief_evidence")
            .select(
                "evidence_id, relationship, created_at, evidence(*)"
            )
            .eq("belief_id", belief_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Read Supporting Evidence ---------------- #

    def get_supporting_evidence(
        self,
        belief_id: str,
    ):
        """
        Get only evidence that supports a belief.
        """

        query = (
            self.client
            .table("belief_evidence")
            .select(
                "evidence_id, relationship, created_at, evidence(*)"
            )
            .eq("belief_id", belief_id)
            .eq("relationship", "supports")
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Read Contradicting Evidence ---------------- #

    def get_contradicting_evidence(
        self,
        belief_id: str,
    ):
        """
        Get only evidence that contradicts a belief.
        """

        query = (
            self.client
            .table("belief_evidence")
            .select(
                "evidence_id, relationship, created_at, evidence(*)"
            )
            .eq("belief_id", belief_id)
            .eq("relationship", "contradicts")
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Read: Evidence → Beliefs ---------------- #

    def get_beliefs_for_evidence(
        self,
        evidence_id: str,
    ):
        """
        Get all beliefs linked to an evidence record.
        """

        query = (
            self.client
            .table("belief_evidence")
            .select(
                "belief_id, relationship, created_at, beliefs(*)"
            )
            .eq("evidence_id", evidence_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

    # ---------------- Delete Relationship ---------------- #

    def unlink_evidence_from_belief(
        self,
        belief_id: str,
        evidence_id: str,
    ):
        """
        Remove the relationship between a belief and evidence.

        The belief and evidence records themselves are not deleted.
        """

        response = (
            self.client
            .table("belief_evidence")
            .delete()
            .eq("belief_id", belief_id)
            .eq("evidence_id", evidence_id)
            .execute()
        )

        return response.data