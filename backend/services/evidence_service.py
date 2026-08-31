from fastapi import HTTPException

from repositories.repository_manager import (
    evidence_repository,
    objective_repository,
    state_event_repository,
)


class EvidenceService:

    # =========================================================
    # RECORD EVIDENCE
    # =========================================================

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

            1. Find the current active objective.
            2. Validate the evidence payload.
            3. Validate the evidence kind.
            4. Persist the evidence against that objective.
            5. Calculate progress using only evidence for
               that objective.
            6. Complete the objective when its target is reached.
            7. Record an outcome event.
            8. Return the result required by DecisionService.

        EvidenceService does NOT interpret whether evidence
        supports or contradicts a belief.

        DecisionService owns belief interpretation and
        post-objective transitions.
        """

        # =====================================================
        # 1. GET ACTIVE OBJECTIVE
        # =====================================================

        objective = objective_repository.get_active_objective(
            project_id=project_id
        )

        if objective is None:
            raise HTTPException(
                status_code=400,
                detail="Project has no active objective.",
            )

        # =====================================================
        # 2. VALIDATE EVIDENCE COUNT
        # =====================================================

        if not isinstance(n, int) or isinstance(n, bool):
            raise HTTPException(
                status_code=400,
                detail="Evidence count must be an integer.",
            )

        if n < 1:
            raise HTTPException(
                status_code=400,
                detail="Evidence count must be at least 1.",
            )

        # =====================================================
        # 3. VALIDATE KIND
        # =====================================================

        expected_kind = objective.get("evidence_kind")

        if not expected_kind:
            raise HTTPException(
                status_code=500,
                detail="Active objective has no evidence kind configured.",
            )

        if kind != expected_kind:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Current objective expects evidence of type "
                    f"'{expected_kind}', not '{kind}'."
                ),
            )

        # =====================================================
        # 4. VALIDATE SOURCE
        # =====================================================

        if not isinstance(source, str) or not source.strip():
            raise HTTPException(
                status_code=400,
                detail="Evidence source cannot be empty.",
            )

        # =====================================================
        # 5. VALIDATE OBSERVATION
        # =====================================================

        if not isinstance(observed, str) or not observed.strip():
            raise HTTPException(
                status_code=400,
                detail="Observed evidence cannot be empty.",
            )

        observed = observed.strip()
        source = source.strip()
        kind = kind.strip()

        # =====================================================
        # 6. VALIDATE QUALITY
        # =====================================================
        #
        # Quality is intentionally deterministic.
        #
        # Supported values are the same values consumed by
        # DecisionService._evaluate_evidence().
        #

        valid_qualities = {
            "anecdote",
            "repeated",
            "behavioral",
            "paid",
        }

        if quality not in valid_qualities:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid evidence quality. "
                    f"Expected one of: {sorted(valid_qualities)}"
                ),
            )

        # =====================================================
        # 7. RECORD EVIDENCE
        # =====================================================

        evidence = evidence_repository.create_evidence(
            project_id=project_id,
            objective_id=objective["id"],
            kind=kind,
            source=source,
            observed=observed,
            quality=quality,
            n=n,
        )

        if evidence is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to record evidence.",
            )

        # =====================================================
        # 8. GET EVIDENCE FOR CURRENT OBJECTIVE ONLY
        # =====================================================
        #
        # Evidence belonging to previous objectives must never
        # contribute toward the current objective's target.
        #

        objective_evidence = (
            evidence_repository.get_objective_evidence(
                project_id=project_id,
                objective_id=objective["id"],
            )
        )

        if objective_evidence is None:
            objective_evidence = []

        # =====================================================
        # 9. CALCULATE PROGRESS
        # =====================================================

        objective_evidence_count = sum(
            max(item.get("n", 1), 1)
            for item in objective_evidence
            if item.get("kind") == expected_kind
        )

        target_count = objective.get("target_count", 1)

        if not isinstance(target_count, int) or target_count < 1:
            raise HTTPException(
                status_code=500,
                detail="Active objective has an invalid target count.",
            )

        objective_completed = (
            objective_evidence_count >= target_count
        )

        # =====================================================
        # 10. COMPLETE OBJECTIVE
        # =====================================================

        updated_objective = objective

        if objective_completed:

            updated_objective = (
                objective_repository.complete_objective(
                    objective_id=objective["id"],
                    project_id=project_id,
                )
            )

            if updated_objective is None:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to complete objective.",
                )

        # =====================================================
        # 11. RECORD OUTCOME EVENT
        # =====================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="outcome_logged",
            payload={
                "objective_id": objective["id"],
                "evidence_id": evidence["id"],
                "kind": kind,
                "source": source,
                "quality": quality,
                "n": n,
                "progress": objective_evidence_count,
                "target": target_count,
                "objective_completed": objective_completed,
            },
        )

        # =====================================================
        # 12. RETURN
        # =====================================================

        return {
            "evidence": evidence,
            "objective": updated_objective,
            "progress": {
                "current": objective_evidence_count,
                "target": target_count,
                "completed": objective_completed,
            },
        }