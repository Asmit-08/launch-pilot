from datetime import datetime, timedelta, timezone

from ai.agents import decision_agent

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
        objective_config: dict | None = None,
    ):
        """
        Create an objective for a belief.

        Existing deterministic belief types use the built-in
        objective configuration.

        AI-discovered beliefs can provide their own objective
        configuration.
        """

        if objective_config is None:

            constraint_key = belief.get("type")

            objective_config = (
                DecisionService._get_objective_config(
                    constraint_key
                )
            )

        required_fields = [
            "text",
            "action",
            "evidence_kind",
            "success_criteria",
            "failure_criteria",
            "do_not_do",
        ]

        for field in required_fields:

            if not objective_config.get(field):
                raise RuntimeError(
                    f"Objective configuration missing field: {field}"
                )

        target_count = objective_config.get(
            "target_count",
            5,
        )

        if (
            not isinstance(target_count, int)
            or target_count < 1
        ):
            raise RuntimeError(
                "Objective target_count must be a positive integer."
            )

        return objective_repository.create_objective(
            project_id=project_id,
            constraint_belief_id=belief["id"],
            text=objective_config["text"],
            action=objective_config["action"],
            target_count=target_count,
            evidence_kind=objective_config["evidence_kind"],
            success_criteria=objective_config[
                "success_criteria"
            ],
            failure_criteria=objective_config[
                "failure_criteria"
            ],
            do_not_do=objective_config[
                "do_not_do"
            ],
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

    @staticmethod
    def _create_ai_belief(
        project_id: str,
        belief_data: dict,
    ):
        """
        Persist a newly discovered AI-generated belief.
        """

        if not isinstance(
            belief_data,
            dict,
        ):
            raise RuntimeError(
                "AI belief response is invalid."
            )

        belief_type = belief_data.get("type")
        claim = belief_data.get("claim")

        if not belief_type:
            raise RuntimeError(
                "AI belief is missing type."
            )

        if not claim:
            raise RuntimeError(
                "AI belief is missing claim."
            )

        return belief_repository.create_belief(
            project_id=project_id,
            claim=claim.strip(),
            belief_type=belief_type.strip(),
            status="untested",
            confidence=0,
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
        Initialize or repair V2 decision state.

        The first startup beliefs remain the current initial
        hypotheses.

        Once those beliefs are resolved, the decision engine no
        longer stops. It dynamically discovers the next important
        startup uncertainty through decision_agent().
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
                    existing_state.get(
                        "active_objective_id"
                    )
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
            # Existing state with no active objective
            # -----------------------------------------------------

            if constraint_belief is None:
                raise RuntimeError(
                    "Project has V2 state but no current constraint belief."
                )

            # If the current constraint is unresolved, recreate
            # the objective for that constraint.
            if constraint_belief.get(
                "status"
            ) != "supported":

                objective = DecisionService._create_objective(
                    project_id=project_id,
                    belief=constraint_belief,
                )

                existing_state = (
                    DecisionService._set_active_objective(
                        project_id=project_id,
                        objective=objective,
                    )
                )

                state_event_repository.create_event(
                    project_id=project_id,
                    event_type="objective_set",
                    payload={
                        "objective_id": objective["id"],
                        "constraint_belief_id": (
                            constraint_belief["id"]
                        ),
                        "reason": (
                            "Created objective for unresolved "
                            "current constraint."
                        ),
                    },
                )

                return {
                    "state": existing_state,
                    "beliefs": existing_beliefs,
                    "constraint": constraint_belief,
                    "objective": objective,
                    "decision": None,
                }

            # -----------------------------------------------------
            # Resolved constraint + no active objective
            #
            # This is a valid completed state.
            # Do not recreate the old objective.
            # -----------------------------------------------------

            return {
                "state": existing_state,
                "beliefs": existing_beliefs,
                "constraint": constraint_belief,
                "objective": None,
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
        #
        # These are initial hypotheses, NOT a fixed roadmap.
        #
        # Once they are resolved, the engine dynamically discovers
        # further beliefs instead of ending.
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
                "score": validation.get(
                    "score",
                    10,
                ),
                "belief": problem_belief,
            },
            {
                "key": "product",
                "score": product.get(
                    "score",
                    10,
                ),
                "belief": solution_belief,
            },
        ]

        if project.get(
            "stage"
        ) in (
            "beta",
            "launched",
        ):

            dimensions.append({
                "key": "willingness_to_pay",
                "score": 10,
                "belief": payment_belief,
            })

        dimensions.sort(
            key=lambda item:
                item["score"]
        )

        constraint = dimensions[0]

        constraint_belief = constraint[
            "belief"
        ]

        # =========================================================
        # 4. DETERMINE STARTUP STAGE
        # =========================================================

        project_stage = project.get(
            "stage"
        )

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
        # 7. CREATE FIRST OBJECTIVE
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
                "constraint_belief_id": (
                    constraint_belief["id"]
                ),
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
                "constraint_belief_id": (
                    constraint_belief["id"]
                ),
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

        Existing deterministic decision logic remains intact.

        When all currently known beliefs have been resolved,
        Plavtora dynamically discovers a new belief rather than
        ending the roadmap.
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

                if (
                    state
                    and state.get(
                        "current_constraint_belief_id"
                    )
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

        belief_id = objective[
            "constraint_belief_id"
        ]

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

        evidence = (
            evidence_repository.get_objective_evidence(
                project_id=project_id,
                objective_id=objective_id,
            )
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
            target_count=objective[
                "target_count"
            ],
        )

        new_status = evaluation[
            "status"
        ]

        new_confidence = evaluation[
            "confidence"
        ]

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
                "old_status": belief.get(
                    "status"
                ),
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
                "reason": evaluation[
                    "reason"
                ],
            },
        )

        # =========================================================
        # 8. BELIEF STILL UNRESOLVED
        # =========================================================

        if new_status != "supported":

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

            next_objective = (
                DecisionService._create_objective(
                    project_id=project_id,
                    belief=updated_belief,
                )
            )

            state = DecisionService._set_active_objective(
                project_id=project_id,
                objective=next_objective,
            )

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

            state_event_repository.create_event(
                project_id=project_id,
                event_type="objective_set",
                payload={
                    "objective_id": (
                        next_objective["id"]
                    ),
                    "constraint_belief_id": belief_id,
                    "reason": (
                        "Created a stronger validation objective "
                        "for the unresolved belief."
                    ),
                },
            )

            state_event_repository.create_event(
                project_id=project_id,
                event_type="decision_made",
                payload={
                    "decision_id": decision["id"],
                    "decision_type": (
                        "retest_constraint"
                    ),
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
        # 9. FIND NEXT EXISTING UNRESOLVED BELIEF
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
        # 10. EXISTING UNRESOLVED BELIEF FOUND
        # =========================================================

        if next_belief is not None:

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
                    "to_belief_id": (
                        next_belief["id"]
                    ),
                    "reason": (
                        "Previous constraint resolved; "
                        "selected the next unresolved belief."
                    ),
                },
            )

            next_objective = (
                DecisionService._create_objective(
                    project_id=project_id,
                    belief=next_belief,
                )
            )

            state = DecisionService._set_active_objective(
                project_id=project_id,
                objective=next_objective,
            )

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

            state_event_repository.create_event(
                project_id=project_id,
                event_type="objective_set",
                payload={
                    "objective_id": (
                        next_objective["id"]
                    ),
                    "constraint_belief_id": (
                        next_belief["id"]
                    ),
                    "reason": (
                        "Created objective for the next "
                        "unresolved belief."
                    ),
                },
            )

            state_event_repository.create_event(
                project_id=project_id,
                event_type="decision_made",
                payload={
                    "decision_id": decision["id"],
                    "decision_type": (
                        "change_constraint"
                    ),
                    "from_belief_id": belief_id,
                    "to_belief_id": (
                        next_belief["id"]
                    ),
                },
            )

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

        # =========================================================
        # 11. NO EXISTING UNRESOLVED BELIEFS
        #
        # THIS IS THE OPEN-ENDED V2 PATH.
        # =========================================================

        state = startup_state_repository.get_state(
            project_id=project_id
        )

        if state is None:
            raise RuntimeError(
                "Startup state not found."
            )

        all_beliefs = belief_repository.get_beliefs(
            project_id=project_id
        )

        # ---------------------------------------------------------
        # Give the decision agent the current startup state and
        # everything that has happened so far.
        # ---------------------------------------------------------

        project_context = {
            "id": project_id,
            "description": state.get(
                "one_liner"
            ),
            "stage": state.get(
                "stage"
            ),
        }

        next_decision = decision_agent(
            project=project_context,
            state=state,
            beliefs=all_beliefs,
            completed_objective=objective,
            evidence=evidence,
        )

        decision_result = next_decision.get(
            "result",
            {},
        )

        new_belief_data = decision_result.get(
            "belief"
        )

        new_objective_config = decision_result.get(
            "objective"
        )

        if not new_belief_data:
            raise RuntimeError(
                "AI decision did not return a new belief."
            )

        if not new_objective_config:
            raise RuntimeError(
                "AI decision did not return a new objective."
            )

        # ---------------------------------------------------------
        # Prevent obvious duplicates.
        # ---------------------------------------------------------

        new_belief_type = new_belief_data.get(
            "type"
        )

        new_belief_claim = new_belief_data.get(
            "claim"
        )

        duplicate = any(
            belief.get("type")
            == new_belief_type
            and belief.get("claim")
            == new_belief_claim
            for belief in all_beliefs
        )

        if duplicate:
            raise RuntimeError(
                "AI returned a duplicate belief."
            )

        # =========================================================
        # 12. CREATE NEW BELIEF
        # =========================================================

        next_belief = (
            DecisionService._create_ai_belief(
                project_id=project_id,
                belief_data=new_belief_data,
            )
        )

        # =========================================================
        # 13. SET NEW CONSTRAINT
        # =========================================================

        state = startup_state_repository.set_constraint(
            project_id=project_id,
            belief_id=next_belief["id"],
            why_this_constraint=(
                new_belief_data.get(
                    "reason"
                )
                or (
                    "Plavtora identified this as the next "
                    "important unresolved startup uncertainty."
                )
            ),
        )

        state_event_repository.create_event(
            project_id=project_id,
            event_type="constraint_changed",
            payload={
                "from_belief_id": belief_id,
                "to_belief_id": next_belief["id"],
                "reason": (
                    new_belief_data.get(
                        "reason"
                    )
                    or (
                        "AI discovered a new startup "
                        "uncertainty."
                    )
                ),
            },
        )

        # =========================================================
        # 14. CREATE NEW OBJECTIVE
        # =========================================================

        next_objective = (
            DecisionService._create_objective(
                project_id=project_id,
                belief=next_belief,
                objective_config=new_objective_config,
            )
        )

        # =========================================================
        # 15. SET NEW OBJECTIVE ACTIVE
        # =========================================================

        state = DecisionService._set_active_objective(
            project_id=project_id,
            objective=next_objective,
        )

        # =========================================================
        # 16. RECORD DECISION
        # =========================================================

        decision = decision_repository.create_decision(
            project_id=project_id,
            decision_type="discover_constraint",
            from_belief_id=belief_id,
            to_belief_id=next_belief["id"],
            evidence_ids=[
                item["id"]
                for item in evidence
            ],
        )

        # =========================================================
        # 17. RECORD OBJECTIVE EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="objective_set",
            payload={
                "objective_id": (
                    next_objective["id"]
                ),
                "constraint_belief_id": (
                    next_belief["id"]
                ),
                "reason": (
                    "Created a new personalized objective "
                    "from the startup's updated reality."
                ),
            },
        )

        # =========================================================
        # 18. RECORD DECISION EVENT
        # =========================================================

        state_event_repository.create_event(
            project_id=project_id,
            event_type="decision_made",
            payload={
                "decision_id": decision["id"],
                "decision_type": (
                    "discover_constraint"
                ),
                "from_belief_id": belief_id,
                "to_belief_id": (
                    next_belief["id"]
                ),
            },
        )

        # =========================================================
        # 19. RETURN
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
            "ai_discovery": True,
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
        """

        if not evidence:

            raise ValueError(
                "Cannot evaluate empty evidence."
            )

        if target_count < 1:

            raise ValueError(
                "Target count must be at least 1."
            )

        evidence_count = sum(
            item.get(
                "n",
                1,
            )
            for item in evidence
        )

        quality_rank = {
            "anecdote": 1,
            "repeated": 2,
            "behavioral": 3,
            "paid": 4,
        }

        qualities = [
            item.get("quality")
            for item in evidence
            if item.get("quality")
            in quality_rank
        ]

        if not qualities:

            dominant_quality = "anecdote"

        else:

            dominant_quality = max(
                qualities,
                key=lambda quality:
                    quality_rank.get(
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
                "dominant_quality": (
                    dominant_quality
                ),
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
                "dominant_quality": (
                    dominant_quality
                ),
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
                "dominant_quality": (
                    dominant_quality
                ),
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
            "dominant_quality": (
                dominant_quality
            ),
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
        """

        candidates = [
            belief
            for belief in beliefs
            if belief["id"]
            != completed_belief_id
            and belief.get(
                "status"
            )
            in (
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
                belief.get(
                    "confidence",
                    0,
                ),
            )
        )

        return candidates[0]

    # =============================================================
    # DETERMINISTIC OBJECTIVE CONFIGURATION
    # =============================================================

    @staticmethod
    def _get_objective_config(
        constraint_key: str,
    ):
        """
        Deterministic configurations for the existing initial
        belief types.

        Newly discovered beliefs receive their objective
        configuration directly from decision_agent().
        """

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
                "target_count": 5,
            }

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
                "target_count": 5,
            }

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
                "target_count": 5,
            }

        raise RuntimeError(
            f"Unsupported constraint belief type: {constraint_key}"
        )