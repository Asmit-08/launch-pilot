from fastapi import HTTPException

from repositories.repository_manager import (
    evidence_repository,
    objective_repository,
    state_event_repository,
)


class EvidenceService:

    @staticmethod
    def record_evidence(
        project_id: str,
        kind: str,
        source: str,
        observed: str,
        quality: str,
        n: int = 1,
    ):
        """
        Record real-world evidence against the project's
        current active objective.

        Responsibilities:
            1. Validate the active objective.
            2. Validate the evidence payload.
            3. Persist the evidence against that objective.
            4. Calculate progress for that objective only.
            5. Complete the objective when its target is reached.
            6. Record the evidence event.

        This service does NOT interpret evidence or determine
        whether a belief is supported or contradicted.

        Post-objective decision logic belongs to DecisionService.
        """

        # =========================================================
        # 1. GET ACTIVE OBJECTIVE
        # =========================================================

        objective = objective_repository.get_active_objective(
            project_id=project_id
        )

        if objective is None:
            raise HTTPException(
                status_code=400,
                detail="Project has no active objective.",
            )

        # =========================================================
        # 2. VALIDATE EVIDENCE COUNT
        # =========================================================

        if n < 1:
            raise HTTPException(
                status_code=400,
                detail="Evidence count must be at least 1.",
            )

        # =========================================================
        # 3. VALIDATE EVIDENCE KIND
        # =========================================================

        expected_kind = objective["evidence_kind"]

        if kind != expected_kind:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Current objective expects evidence of type "
                    f"'{expected_kind}', not '{kind}'."
                ),
            )

        # =========================================================
        # 4. RECORD EVIDENCE
        # =========================================================

        evidence = evidence_repository.create_evidence(
            project_id=project_id,
            objective_id=objective["id"],
            kind=kind,
            source=source,
            observed=observed,
            quality=quality,
            n=n,
        )

        # =========================================================
        # 5. GET EVIDENCE FOR THIS OBJECTIVE ONLY
        # =========================================================
        #
        # Evidence from previous objectives must never contribute
        # to the progress of the current objective.
        #

        objective_evidence = (
            evidence_repository.get_objective_evidence(
                project_id=project_id,
                objective_id=objective["id"],
            )
        )

        # =========================================================
        # 6. CALCULATE OBJECTIVE PROGRESS
        # =========================================================

        objective_evidence_count = sum(
            item.get("n", 1)
            for item in objective_evidence
            if item.get("kind") == expected_kind
        )

        target_count = objective["target_count"]

        objective_completed = (
            objective_evidence_count >= target_count
        )

        # =========================================================
        # 7. COMPLETE OBJECTIVE IF TARGET REACHED
        # =========================================================

        updated_objective = objective

        if objective_completed:

            updated_objective = (
                objective_repository.complete_objective(
                    objective_id=objective["id"],
                    project_id=project_id,
                )
            )

        # =========================================================
        # 8. RECORD OUTCOME EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="outcome_logged",
            payload={
                "objective_id": objective["id"],
                "evidence_id": evidence["id"],
                "kind": kind,
                "n": n,
                "progress": objective_evidence_count,
                "target": target_count,
                "objective_completed": objective_completed,
            },
        )

        # =========================================================
        # 9. RETURN
        # =========================================================
        #
        # Decision interpretation intentionally does not happen
        # here yet.
        #
        # The next deterministic decision step should consume
        # this result and determine:
        #
        #   evidence → belief update → next constraint/objective
        #
        # That keeps evidence collection separate from decision
        # logic and prevents the service layer from becoming
        # tightly coupled.
        #

        return {
            "evidence": evidence,
            "objective": updated_objective,
            "progress": {
                "current": objective_evidence_count,
                "target": target_count,
                "completed": objective_completed,
            },
        }

