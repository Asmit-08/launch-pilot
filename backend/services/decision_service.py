from datetime import datetime, timedelta, timezone

from repositories.repository_manager import (
    belief_repository,
    evidence_repository,
    objective_repository,
    startup_state_repository,
    decision_repository,
    state_event_repository,
)


class DecisionService:

    # =============================================================
    # INTERNAL HELPERS
    # =============================================================

    @staticmethod
    def _get_due_at():
        """
        Objectives are currently given a two-day execution window.
        """

        return (
            datetime.now(timezone.utc)
            + timedelta(days=2)
        ).isoformat()

    @staticmethod
    def _create_objective(
        project_id: str,
        belief: dict,
    ):
        """
        Create an objective for a belief using deterministic
        configuration.

        Keeping objective creation in one place prevents different
        decision paths from accidentally creating objectives with
        different rules.
        """

        constraint_key = belief.get("type")

        objective_config = (
            DecisionService._get_objective_config(
                constraint_key
            )
        )

        return objective_repository.create_objective(
            project_id=project_id,
            constraint_belief_id=belief["id"],
            text=objective_config["text"],
            action=objective_config["action"],
            target_count=5,
            evidence_kind=objective_config["evidence_kind"],
            success_criteria=objective_config["success_criteria"],
            failure_criteria=objective_config["failure_criteria"],
            do_not_do=objective_config["do_not_do"],
            due_at=DecisionService._get_due_at(),
        )

    @staticmethod
    def _set_active_objective(
        project_id: str,
        objective: dict,
    ):
        """
        Set the supplied objective as the project's active objective.
        """

        return startup_state_repository.set_active_objective(
            project_id=project_id,
            objective_id=objective["id"],
        )

    # =============================================================
    # INITIALIZATION
    # =============================================================

    @staticmethod
    def initialize_project(
        project: dict,
        audit_result: dict,
    ):
        """
        Initialize or repair the V2 decision state.

        Initialization is deterministic and idempotent.

        Existing state + active objective:
            return the existing state.

        Existing state + no active objective:
            create a replacement objective for the current constraint.

        No existing state:
            create initial beliefs,
            select the weakest audit dimension,
            create the first objective,
            record the initial decision.

        IMPORTANT:

        The audit provides hypotheses/signals only.
        It does NOT count as real-world evidence.
        """

        project_id = project["id"]

        # =========================================================
        # 0. CHECK EXISTING STATE
        # =========================================================

        existing_state = startup_state_repository.get_state(
            project_id=project_id
        )

        if existing_state is not None:

            existing_beliefs = belief_repository.get_beliefs(
                project_id=project_id
            )

            constraint_belief = None

            constraint_belief_id = existing_state.get(
                "current_constraint_belief_id"
            )

            if constraint_belief_id:

                constraint_belief = belief_repository.get_belief(
                    belief_id=constraint_belief_id,
                    project_id=project_id,
                )

            existing_objective = (
                objective_repository.get_active_objective(
                    project_id=project_id
                )
            )

            # -----------------------------------------------------
            # Existing healthy state
            # -----------------------------------------------------

            if existing_objective is not None:

                if (
                    existing_state.get("active_objective_id")
                    != existing_objective["id"]
                ):
                    existing_state = (
                        startup_state_repository.set_active_objective(
                            project_id=project_id,
                            objective_id=existing_objective["id"],
                        )
                    )

                return {
                    "state": existing_state,
                    "beliefs": existing_beliefs,
                    "constraint": constraint_belief,
                    "objective": existing_objective,
                    "decision": None,
                }

            # -----------------------------------------------------
        # Existing state but no active objective
        # -----------------------------------------------------

        if constraint_belief is None:
            raise RuntimeError(
                "Project has V2 state but no current constraint belief."
            )

        # If the current constraint is already resolved,
        # the absence of an active objective is intentional.
        # Do NOT recreate the completed objective on refresh.
        if constraint_belief.get("status") == "supported":
            return {
                "state": existing_state,
                "beliefs": existing_beliefs,
                "constraint": constraint_belief,
                "objective": None,
                "decision": None,
            }

        constraint_key = constraint_belief.get("type")

        objective_config = (
            DecisionService._get_objective_config(
                constraint_key
            )
        )

        due_at = (
            datetime.now(timezone.utc)
            + timedelta(days=2)
        ).isoformat()

        objective = objective_repository.create_objective(
            project_id=project_id,
            constraint_belief_id=constraint_belief["id"],
            text=objective_config["text"],
            action=objective_config["action"],
            target_count=5,
            evidence_kind=objective_config["evidence_kind"],
            success_criteria=objective_config["success_criteria"],
            failure_criteria=objective_config["failure_criteria"],
            do_not_do=objective_config["do_not_do"],
            due_at=due_at,
        )

        existing_state = (
            startup_state_repository.set_active_objective(
                project_id=project_id,
                objective_id=objective["id"],
            )
        )

        state_event_repository.create_event(
            project_id=project_id,
            event_type="objective_set",
            payload={
                "objective_id": objective["id"],
                "constraint_belief_id": constraint_belief["id"],
                "reason": "Created replacement objective.",
            },
        )

        return {
            "state": existing_state,
            "beliefs": existing_beliefs,
            "constraint": constraint_belief,
            "objective": objective,
            "decision": None,
        }

        # =========================================================
        # 1. NO EXISTING STATE → INITIALIZE FROM AUDIT
        # =========================================================

        validation = audit_result.get(
            "validation",
            {},
        )

        product = audit_result.get(
            "product",
            {},
        )

        # =========================================================
        # 2. CREATE INITIAL BELIEFS
        # =========================================================

        beliefs = []

        problem_belief = belief_repository.create_belief(
            project_id=project_id,
            claim=(
                "The target users have a meaningful problem that "
                "the product is solving."
            ),
            belief_type="problem",
            status="untested",
            confidence=0,
        )

        beliefs.append(problem_belief)

        solution_belief = belief_repository.create_belief(
            project_id=project_id,
            claim=(
                "The product provides a sufficiently valuable solution "
                "for the target users."
            ),
            belief_type="solution_fit",
            status="untested",
            confidence=0,
        )

        beliefs.append(solution_belief)

        payment_belief = belief_repository.create_belief(
            project_id=project_id,
            claim=(
                "Target users are willing to pay for the product."
            ),
            belief_type="willingness_to_pay",
            status="untested",
            confidence=0,
        )

        beliefs.append(payment_belief)

        # =========================================================
        # 3. DETERMINE INITIAL CONSTRAINT
        # =========================================================

        dimensions = [
            {
                "key": "validation",
                "score": validation.get("score", 10),
                "belief": problem_belief,
            },
            {
                "key": "product",
                "score": product.get("score", 10),
                "belief": solution_belief,
            },
        ]

        # Payment becomes relevant once the product has reached
        # beta/launch maturity.
        #
        # It remains in the belief system for every project, but
        # only participates in initial constraint selection at
        # beta/launch stage.

        if project.get("stage") in (
            "beta",
            "launched",
        ):

            dimensions.append({
                "key": "willingness_to_pay",
                "score": 10,
                "belief": payment_belief,
            })

        dimensions.sort(
            key=lambda item: item["score"]
        )

        constraint = dimensions[0]

        constraint_belief = constraint["belief"]

        # =========================================================
        # 4. DETERMINE STARTUP STAGE
        # =========================================================

        project_stage = project.get("stage")

        if project_stage == "idea":

            startup_stage = "problem"

        elif project_stage == "building":

            startup_stage = "solution"

        elif project_stage == "beta":

            startup_stage = "mvp"

        else:

            startup_stage = "revenue"

        # =========================================================
        # 5. CREATE STARTUP STATE
        # =========================================================

        state = startup_state_repository.create_state(
            project_id=project_id,
            stage=startup_stage,
            one_liner=(
                project.get("description")
                or project.get("name")
                or "Startup"
            ),
        )

        # =========================================================
        # 6. SET CURRENT CONSTRAINT
        # =========================================================

        state = startup_state_repository.set_constraint(
            project_id=project_id,
            belief_id=constraint_belief["id"],
            why_this_constraint=(
                f"{constraint['key']} currently has the weakest "
                f"audit signal and therefore represents the "
                f"highest-priority uncertainty to test."
            ),
        )

        # =========================================================
        # 7. BUILD FIRST OBJECTIVE
        # =========================================================

        objective = DecisionService._create_objective(
            project_id=project_id,
            belief=constraint_belief,
        )

        # =========================================================
        # 8. SET ACTIVE OBJECTIVE
        # =========================================================

        state = DecisionService._set_active_objective(
            project_id=project_id,
            objective=objective,
        )

        # =========================================================
        # 9. RECORD INITIAL DECISION
        # =========================================================

        decision = decision_repository.create_decision(
            project_id=project_id,
            decision_type="investigate",
            from_belief_id=None,
            to_belief_id=constraint_belief["id"],
            evidence_ids=[],
        )

        # =========================================================
        # 10. RECORD INITIAL EVENTS
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="constraint_changed",
            payload={
                "constraint_belief_id": constraint_belief["id"],
                "reason": (
                    f"Lowest audit dimension: "
                    f"{constraint['key']}"
                ),
            },
        )

        state_event_repository.create_event(
            project_id=project_id,
            event_type="objective_set",
            payload={
                "objective_id": objective["id"],
                "constraint_belief_id": constraint_belief["id"],
            },
        )

        state_event_repository.create_event(
            project_id=project_id,
            event_type="decision_made",
            payload={
                "decision_id": decision["id"],
                "decision_type": "investigate",
            },
        )

        return {
            "state": state,
            "beliefs": beliefs,
            "constraint": constraint_belief,
            "objective": objective,
            "decision": decision,
        }

    # =============================================================
    # OBJECTIVE COMPLETION / DECISION TRANSITION
    # =============================================================

    @staticmethod
    def process_objective_completion(
        project_id: str,
        objective_id: str,
    ):
        """
        Process a completed objective.

        Flow:

            completed objective
                    ↓
            retrieve evidence
                    ↓
            evaluate evidence
                    ↓
            update belief
                    ↓
            determine whether belief is resolved
                    ↓
            ┌───────────────┴────────────────┐
            │                                │
        resolved                         unresolved
            ↓                                ↓
        next belief                    same belief
        + objective                     + retest objective
            ↓                                ↓
        update state                    keep constraint
            ↓
        record decision/events

        This logic is deterministic.
        """

        # =========================================================
        # 1. GET COMPLETED OBJECTIVE
        # =========================================================

        objective = objective_repository.get_objective(
            objective_id=objective_id,
            project_id=project_id,
        )

        if objective is None:

            raise ValueError(
                "Objective not found."
            )

        if objective["status"] != "completed":

            raise ValueError(
                "Only completed objectives can be processed."
            )

        # =========================================================
        # 2. IDEMPOTENCY CHECK
        # =========================================================
        #
        # If another active objective exists, the transition has
        # already been processed.
        #

        existing_active_objective = (
            objective_repository.get_active_objective(
                project_id=project_id
            )
        )

        if existing_active_objective is not None:

            if existing_active_objective["id"] != objective_id:

                state = startup_state_repository.get_state(
                    project_id=project_id
                )

                current_constraint = None

                if state and state.get(
                    "current_constraint_belief_id"
                ):

                    current_constraint = (
                        belief_repository.get_belief(
                            belief_id=state[
                                "current_constraint_belief_id"
                            ],
                            project_id=project_id,
                        )
                    )

                return {
                    "already_processed": True,
                    "belief": None,
                    "objective": objective,
                    "next_belief": current_constraint,
                    "next_objective": existing_active_objective,
                    "state": state,
                    "decision": None,
                    "evaluation": None,
                }

        # =========================================================
        # 3. GET CURRENT CONSTRAINT BELIEF
        # =========================================================

        belief_id = objective["constraint_belief_id"]

        belief = belief_repository.get_belief(
            belief_id=belief_id,
            project_id=project_id,
        )

        if belief is None:

            raise RuntimeError(
                "Objective references a belief that does not exist."
            )

        # =========================================================
        # 4. GET OBJECTIVE-SCOPED EVIDENCE
        # =========================================================

        evidence = evidence_repository.get_objective_evidence(
            project_id=project_id,
            objective_id=objective_id,
        )

        if not evidence:

            raise RuntimeError(
                "Completed objective has no recorded evidence."
            )

        # =========================================================
        # 5. EVALUATE EVIDENCE
        # =========================================================

        evaluation = DecisionService._evaluate_evidence(
            evidence=evidence,
            target_count=objective["target_count"],
        )

        new_status = evaluation["status"]
        new_confidence = evaluation["confidence"]

        # =========================================================
        # 6. UPDATE BELIEF
        # =========================================================

        updated_belief = belief_repository.update_belief(
            belief_id=belief_id,
            project_id=project_id,
            updates={
                "status": new_status,
                "confidence": new_confidence,
            },
        )

        if updated_belief is None:

            raise RuntimeError(
                "Belief update failed."
            )

        # =========================================================
        # 7. RECORD BELIEF UPDATE EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="belief_updated",
            payload={
                "belief_id": belief_id,
                "objective_id": objective_id,
                "old_status": belief.get("status"),
                "new_status": new_status,
                "old_confidence": belief.get(
                    "confidence",
                    0,
                ),
                "new_confidence": new_confidence,
                "evidence_count": evaluation[
                    "evidence_count"
                ],
                "evidence_quality": evaluation[
                    "dominant_quality"
                ],
                "reason": evaluation["reason"],
            },
        )

        # =========================================================
        # 8. DETERMINE WHETHER BELIEF IS ACTUALLY RESOLVED
        # =========================================================
        #
        # Reaching the objective count does NOT automatically
        # resolve the belief.
        #
        # Example:
        #
        # 5 anecdotes → objective complete
        #              → belief remains weak
        #              → same constraint must be tested again
        #
        # Whereas:
        #
        # 5 repeated/behavioral/paid observations
        #              → belief supported
        #              → move to next unresolved belief
        #

        if new_status != "supported":

            # -----------------------------------------------------
            # Keep the same constraint
            # -----------------------------------------------------

            state = startup_state_repository.set_constraint(
                project_id=project_id,
                belief_id=belief_id,
                why_this_constraint=(
                    "The objective was completed, but the evidence "
                    "was not strong enough to resolve the current "
                    "belief. The same constraint requires stronger "
                    "validation."
                ),
            )

            # -----------------------------------------------------
            # Create retest objective
            # -----------------------------------------------------

            next_objective = DecisionService._create_objective(
                project_id=project_id,
                belief=updated_belief,
            )

            # -----------------------------------------------------
            # Set retest objective active
            # -----------------------------------------------------

            state = DecisionService._set_active_objective(
                project_id=project_id,
                objective=next_objective,
            )

            # -----------------------------------------------------
            # Record decision
            # -----------------------------------------------------

            decision = decision_repository.create_decision(
                project_id=project_id,
                decision_type="retest_constraint",
                from_belief_id=belief_id,
                to_belief_id=belief_id,
                evidence_ids=[
                    item["id"]
                    for item in evidence
                ],
            )

            # -----------------------------------------------------
            # Record constraint event
            # -----------------------------------------------------

            state_event_repository.create_event(
                project_id=project_id,
                event_type="constraint_changed",
                payload={
                    "from_belief_id": belief_id,
                    "to_belief_id": belief_id,
                    "reason": (
                        "Evidence target was reached, but the "
                        "belief remains unresolved."
                    ),
                },
            )

            # -----------------------------------------------------
            # Record objective event
            # -----------------------------------------------------

            state_event_repository.create_event(
                project_id=project_id,
                event_type="objective_set",
                payload={
                    "objective_id": next_objective["id"],
                    "constraint_belief_id": belief_id,
                    "reason": (
                        "Created a stronger validation objective "
                        "for the unresolved belief."
                    ),
                },
            )

            # -----------------------------------------------------
            # Record decision event
            # -----------------------------------------------------

            state_event_repository.create_event(
                project_id=project_id,
                event_type="decision_made",
                payload={
                    "decision_id": decision["id"],
                    "decision_type": "retest_constraint",
                    "from_belief_id": belief_id,
                    "to_belief_id": belief_id,
                },
            )

            return {
                "already_processed": False,
                "belief": updated_belief,
                "objective": objective,
                "next_belief": updated_belief,
                "next_objective": next_objective,
                "state": state,
                "decision": decision,
                "evaluation": evaluation,
            }

        # =========================================================
        # 9. FIND NEXT UNRESOLVED BELIEF
        # =========================================================

        unresolved_beliefs = (
            belief_repository.get_unresolved_beliefs(
                project_id=project_id
            )
        )

        next_belief = DecisionService._select_next_belief(
            beliefs=unresolved_beliefs,
            completed_belief_id=belief_id,
        )

        # =========================================================
        # 10. NO UNRESOLVED BELIEFS REMAIN
        # =========================================================

        if next_belief is None:

            state = startup_state_repository.set_active_objective(
                project_id=project_id,
                objective_id=None,
            )

            decision = decision_repository.create_decision(
                project_id=project_id,
                decision_type="stage_up",
                from_belief_id=belief_id,
                to_belief_id=None,
                evidence_ids=[
                    item["id"]
                    for item in evidence
                ],
            )

            state_event_repository.create_event(
                project_id=project_id,
                event_type="decision_made",
                payload={
                    "decision_id": decision["id"],
                    "decision_type": "stage_up",
                    "reason": (
                        "The current objective resolved the active "
                        "constraint and no unresolved beliefs remain."
                    ),
                },
            )

            return {
                "already_processed": False,
                "belief": updated_belief,
                "objective": objective,
                "next_belief": None,
                "next_objective": None,
                "state": state,
                "decision": decision,
                "evaluation": evaluation,
            }

        # =========================================================
        # 11. CHANGE CURRENT CONSTRAINT
        # =========================================================

        state = startup_state_repository.set_constraint(
            project_id=project_id,
            belief_id=next_belief["id"],
            why_this_constraint=(
                "The previous constraint was resolved. "
                "This is the next unresolved startup belief "
                "requiring validation."
            ),
        )

        state_event_repository.create_event(
            project_id=project_id,
            event_type="constraint_changed",
            payload={
                "from_belief_id": belief_id,
                "to_belief_id": next_belief["id"],
                "reason": (
                    "Previous constraint resolved; "
                    "selected next unresolved belief."
                ),
            },
        )

        # =========================================================
        # 12. CREATE NEXT OBJECTIVE
        # =========================================================

        next_objective = DecisionService._create_objective(
            project_id=project_id,
            belief=next_belief,
        )

        # =========================================================
        # 13. SET NEXT ACTIVE OBJECTIVE
        # =========================================================

        state = DecisionService._set_active_objective(
            project_id=project_id,
            objective=next_objective,
        )

        # =========================================================
        # 14. RECORD DECISION
        # =========================================================

        decision = decision_repository.create_decision(
            project_id=project_id,
            decision_type="change_constraint",
            from_belief_id=belief_id,
            to_belief_id=next_belief["id"],
            evidence_ids=[
                item["id"]
                for item in evidence
            ],
        )

        # =========================================================
        # 15. RECORD NEXT OBJECTIVE EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="objective_set",
            payload={
                "objective_id": next_objective["id"],
                "constraint_belief_id": next_belief["id"],
                "reason": (
                    "Created objective for next unresolved belief."
                ),
            },
        )

        # =========================================================
        # 16. RECORD DECISION EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="decision_made",
            payload={
                "decision_id": decision["id"],
                "decision_type": "change_constraint",
                "from_belief_id": belief_id,
                "to_belief_id": next_belief["id"],
            },
        )

        # =========================================================
        # 17. RETURN
        # =========================================================

        return {
            "already_processed": False,
            "belief": updated_belief,
            "objective": objective,
            "next_belief": next_belief,
            "next_objective": next_objective,
            "state": state,
            "decision": decision,
            "evaluation": evaluation,
        }

    # =============================================================
    # DETERMINISTIC EVIDENCE EVALUATION
    # =============================================================

    @staticmethod
    def _evaluate_evidence(
        evidence: list,
        target_count: int,
    ):
        """
        Evaluate evidence deterministically.

        Evidence quality hierarchy:

            anecdote
                → weakest

            repeated
                → stronger

            behavioral
                → strong

            paid
                → strongest

        The objective target must be reached before a belief
        can become supported.

        IMPORTANT:

        This method does not invent contradiction.

        The current evidence payload does not contain an explicit
        support/contradiction field, so contradiction cannot be
        inferred reliably.
        """

        if not evidence:

            raise ValueError(
                "Cannot evaluate empty evidence."
            )

        if target_count < 1:

            raise ValueError(
                "Target count must be at least 1."
            )

        # ---------------------------------------------------------
        # Evidence count
        # ---------------------------------------------------------

        evidence_count = sum(
            item.get("n", 1)
            for item in evidence
        )

        # ---------------------------------------------------------
        # Determine dominant quality
        # ---------------------------------------------------------

        quality_rank = {
            "anecdote": 1,
            "repeated": 2,
            "behavioral": 3,
            "paid": 4,
        }

        qualities = [
            item.get("quality")
            for item in evidence
            if item.get("quality") in quality_rank
        ]

        if not qualities:

            dominant_quality = "anecdote"

        else:

            dominant_quality = max(
                qualities,
                key=lambda quality: quality_rank.get(
                    quality,
                    0,
                ),
            )

        quality_score = quality_rank.get(
            dominant_quality,
            1,
        )

        # =========================================================
        # TARGET NOT REACHED
        # =========================================================

        if evidence_count < target_count:

            if quality_score >= 3:

                confidence = 2

            else:

                confidence = 1

            return {
                "status": "weak",
                "confidence": confidence,
                "evidence_count": evidence_count,
                "dominant_quality": dominant_quality,
                "reason": (
                    "Evidence exists but the objective target "
                    "has not yet been reached."
                ),
            }

        # =========================================================
        # TARGET REACHED + STRONG EVIDENCE
        # =========================================================

        if quality_score >= 3:

            return {
                "status": "supported",
                "confidence": 3,
                "evidence_count": evidence_count,
                "dominant_quality": dominant_quality,
                "reason": (
                    "Objective evidence target was reached with "
                    "behavioral or transactional evidence."
                ),
            }

        # =========================================================
        # TARGET REACHED + REPEATED EVIDENCE
        # =========================================================

        if quality_score == 2:

            return {
                "status": "supported",
                "confidence": 2,
                "evidence_count": evidence_count,
                "dominant_quality": dominant_quality,
                "reason": (
                    "Objective evidence target was reached with "
                    "repeated evidence."
                ),
            }

        # =========================================================
        # TARGET REACHED + ANECDOTAL EVIDENCE
        # =========================================================

        return {
            "status": "weak",
            "confidence": 1,
            "evidence_count": evidence_count,
            "dominant_quality": dominant_quality,
            "reason": (
                "Objective evidence target was reached, but the "
                "available evidence remains anecdotal. The belief "
                "is therefore not considered resolved."
            ),
        }

    # =============================================================
    # NEXT BELIEF SELECTION
    # =============================================================

    @staticmethod
    def _select_next_belief(
        beliefs: list,
        completed_belief_id: str,
    ):
        """
        Select the next unresolved belief.

        Priority:

            1. untested
            2. weak
            3. contradicted

        The belief associated with the completed objective is
        excluded.
        """

        candidates = [
            belief
            for belief in beliefs
            if belief["id"] != completed_belief_id
            and belief.get("status") in (
                "untested",
                "weak",
                "contradicted",
            )
        ]

        if not candidates:

            return None

        priority = {
            "untested": 0,
            "weak": 1,
            "contradicted": 2,
        }

        candidates.sort(
            key=lambda belief: (
                priority.get(
                    belief.get("status"),
                    99,
                ),
                belief.get("confidence", 0),
            )
        )

        return candidates[0]

    # =============================================================
    # OBJECTIVE CONFIGURATION
    # =============================================================

    @staticmethod
    def _get_objective_config(
        constraint_key: str,
    ):
        """
        Return deterministic objective configuration
        for a belief type.

        Supported constraint types:

            problem
            validation
            solution_fit
            product
            willingness_to_pay
        """

        # =========================================================
        # PROBLEM / VALIDATION
        # =========================================================

        if constraint_key in (
            "problem",
            "validation",
        ):

            return {
                "text": (
                    "Validate whether the target users experience "
                    "the identified problem."
                ),
                "action": (
                    "Talk to real target users and collect direct "
                    "problem evidence."
                ),
                "evidence_kind": "interview",
                "success_criteria": (
                    "Multiple target users independently confirm "
                    "the problem is real and meaningful."
                ),
                "failure_criteria": (
                    "Target users do not consistently recognize "
                    "the problem or consider it important."
                ),
                "do_not_do": (
                    "Do not spend significant effort building "
                    "new features before validating the problem."
                ),
            }

        # =========================================================
        # SOLUTION FIT / PRODUCT
        # =========================================================

        if constraint_key in (
            "solution_fit",
            "product",
        ):

            return {
                "text": (
                    "Validate whether the proposed solution delivers "
                    "a meaningful outcome for target users."
                ),
                "action": (
                    "Put the current product in front of target users "
                    "and observe whether they use it for the intended "
                    "outcome."
                ),
                "evidence_kind": "usage",
                "success_criteria": (
                    "Target users successfully use the product and "
                    "demonstrate meaningful value from the core workflow."
                ),
                "failure_criteria": (
                    "Target users do not meaningfully use the product "
                    "or fail to perceive value from the core workflow."
                ),
                "do_not_do": (
                    "Do not add major features before validating "
                    "core solution usage."
                ),
            }

        # =========================================================
        # WILLINGNESS TO PAY
        # =========================================================

        if constraint_key == "willingness_to_pay":

            return {
                "text": (
                    "Validate whether target users are willing to pay "
                    "for the product."
                ),
                "action": (
                    "Present the product and pricing to qualified "
                    "target users and measure genuine buying intent."
                ),
                "evidence_kind": "checkout_attempt",
                "success_criteria": (
                    "Qualified users demonstrate concrete willingness "
                    "to pay through a meaningful buying action."
                ),
                "failure_criteria": (
                    "Qualified users consistently reject the offer "
                    "or show no meaningful buying intent."
                ),
                "do_not_do": (
                    "Do not increase acquisition spending before "
                    "establishing willingness to pay."
                ),
            }

        raise RuntimeError(
            f"Unsupported constraint belief type: {constraint_key}"
        )