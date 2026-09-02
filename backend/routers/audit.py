from fastapi import APIRouter, Depends, HTTPException

from core.auth import get_current_user
from schemas import LaunchAuditRequest, ObjectiveOutcomeRequest

from repositories.repository_manager import (
    audit_repository,
    startup_state_repository,
    objective_repository,
    belief_repository,
)

from services.audit_service import AuditService
from services.evidence_service import EvidenceService
from services.decision_service import DecisionService
from services.usage_service import usage_service


router = APIRouter()


# =========================================================
# HELPERS
# =========================================================

def _get_objective_usage(
    project_id: str,
    current_user: dict,
):
    """
    Return the project's Daily Objective usage state.

    Free:
        3 completed objectives maximum.

    Premium / Super Premium:
        Unlimited objectives.
    """

    subscription = current_user.get(
        "subscription",
        "free",
    )

    completed_objectives = (
        objective_repository.get_objectives_by_status(
            project_id=project_id,
            status="completed",
        )
    )

    completed_count = len(
        completed_objectives
    )

    if subscription == "none":
        limit = 3
        limit_reached = (
            completed_count >= limit
        )
    else:
        limit = None
        limit_reached = False

    return {
        "subscription": subscription,
        "completed": completed_count,
        "limit": limit,
        "limit_reached": limit_reached,
    }


# =========================================================
# AUDIT
# =========================================================

@router.post("/audit")
def audit(
    data: LaunchAuditRequest,
    current_user=Depends(get_current_user),
):
    # -----------------------------------
    # Check audit usage BEFORE AI call
    # -----------------------------------

    usage_service.check_limit(
        current_user,
        "audits",
    )

    # -----------------------------------
    # Generate audit
    # -----------------------------------

    result = AuditService.generate_audit(
        data,
        current_user,
    )

    # -----------------------------------
    # Consume one audit only after
    # successful audit generation
    # -----------------------------------

    usage_service.consume(
        current_user,
        "audits",
    )

    return result


# =========================================================
# V2 — DAILY OBJECTIVE
# =========================================================

@router.get(
    "/projects/{project_id}/daily-objective"
)
def get_daily_objective(
    project_id: str,
    current_user=Depends(get_current_user),
):
    """
    Return the startup's current Daily Objective state.

    Includes objective usage so the frontend can distinguish
    between a genuinely inactive state and a Free-plan limit.
    """

    # -----------------------------------------------------
    # 1. Verify project belongs to current user
    # -----------------------------------------------------

    project = audit_repository.get_project_by_id(
        project_id=project_id,
        user_id=current_user["id"],
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # -----------------------------------------------------
    # 2. Get startup state
    # -----------------------------------------------------

    state = startup_state_repository.get_state(
        project_id=project_id
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Startup V2 state has not been initialized.",
        )

    # -----------------------------------------------------
    # 3. Get objective usage
    # -----------------------------------------------------

    objective_usage = _get_objective_usage(
        project_id=project_id,
        current_user=current_user,
    )

    # -----------------------------------------------------
    # 4. Free plan exhausted
    # -----------------------------------------------------

    if objective_usage["limit_reached"]:

        return {
            "project_id": project_id,
            "has_active_objective": False,
            "state": state,
            "objective": None,
            "constraint": None,
            "objective_usage": objective_usage,
        }

    # -----------------------------------------------------
    # 5. Get active objective
    # -----------------------------------------------------

    objective = objective_repository.get_active_objective(
        project_id=project_id
    )

    # -----------------------------------------------------
    # 6. No active objective
    # -----------------------------------------------------

    if objective is None:

        return {
            "project_id": project_id,
            "has_active_objective": False,
            "state": state,
            "objective": None,
            "constraint": None,
            "objective_usage": objective_usage,
        }

    # -----------------------------------------------------
    # 7. Get current constraint
    # -----------------------------------------------------

    constraint = None

    constraint_belief_id = state.get(
        "current_constraint_belief_id"
    )

    if constraint_belief_id:

        constraint = belief_repository.get_belief(
            belief_id=constraint_belief_id,
            project_id=project_id,
        )

    # -----------------------------------------------------
    # 8. Return objective context
    # -----------------------------------------------------

    return {
        "project_id": project_id,
        "has_active_objective": True,
        "state": state,
        "constraint": constraint,
        "objective": objective,
        "objective_usage": objective_usage,
    }


# =========================================================
# V2 — SUBMIT OBJECTIVE OUTCOME
# =========================================================

@router.post(
    "/projects/{project_id}/daily-objective/outcome"
)
def submit_objective_outcome(
    project_id: str,
    data: ObjectiveOutcomeRequest,
    current_user=Depends(get_current_user),
):
    """
    Submit the founder's outcome for the current active objective.

    The submission is converted into real-world evidence.

    Flow:

        Founder outcome
              ↓
        EvidenceService
              ↓
        Evidence saved
              ↓
        Objective progress evaluated
              ↓
        If complete:
            DecisionService processes transition
              ↓
        Objective usage returned
    """

    # -----------------------------------------------------
    # 1. Verify project belongs to current user
    # -----------------------------------------------------

    project = audit_repository.get_project_by_id(
        project_id=project_id,
        user_id=current_user["id"],
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # -----------------------------------------------------
    # 2. Get active objective
    # -----------------------------------------------------

    objective = objective_repository.get_active_objective(
        project_id=project_id
    )

    if objective is None:
        raise HTTPException(
            status_code=400,
            detail="Project has no active objective.",
        )

    # -----------------------------------------------------
    # 3. Validate quantity
    # -----------------------------------------------------

    if data.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1.",
        )

    # -----------------------------------------------------
    # 4. Validate completion status
    # -----------------------------------------------------

    valid_statuses = {
        "completed",
        "success",
        "partial",
        "failed",
        "not_completed",
    }

    if data.completion_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid completion_status. "
                f"Expected one of: {sorted(valid_statuses)}"
            ),
        )

    # -----------------------------------------------------
    # 5. Determine evidence quality
    # -----------------------------------------------------

    if data.completion_status in (
        "completed",
        "success",
    ):
        quality = "repeated"
    else:
        quality = "anecdote"

    # -----------------------------------------------------
    # 6. Determine observed text
    # -----------------------------------------------------

    observed_parts = [
        data.observations.strip()
    ]

    if data.evidence:
        observed_parts.append(
            f"Additional evidence: {data.evidence.strip()}"
        )

    if data.user_interpretation:
        observed_parts.append(
            f"Founder interpretation: "
            f"{data.user_interpretation.strip()}"
        )

    if data.unexpected_result:
        observed_parts.append(
            f"Unexpected result: "
            f"{data.unexpected_result.strip()}"
        )

    observed = "\n".join(
        part
        for part in observed_parts
        if part
    )

    if not observed:
        raise HTTPException(
            status_code=400,
            detail="Observations cannot be empty.",
        )

    # -----------------------------------------------------
    # 7. Check V2 objective limit
    # -----------------------------------------------------

    # A completed/successful objective consumes the
    # Free-plan allowance.
    #
    # This happens BEFORE evidence is recorded so a blocked
    # submission does not create an evidence record.

    if data.completion_status in (
        "completed",
        "success",
    ):

        objective_usage = _get_objective_usage(
            project_id=project_id,
            current_user=current_user,
        )

        if objective_usage["limit_reached"]:

            raise HTTPException(
                status_code=403,
                detail={
                    "error": "objective_limit_reached",
                    "message": (
                        "Free plan limit reached. "
                        "Upgrade to continue with Daily Objectives."
                    ),
                    "objective_usage": objective_usage,
                },
            )

    # -----------------------------------------------------
    # 8. Record evidence
    # -----------------------------------------------------

    evidence_result = EvidenceService.record_evidence(
        project_id=project_id,
        kind=objective["evidence_kind"],
        source="founder_report",
        observed=observed,
        quality=quality,
        n=data.quantity,
    )

    # -----------------------------------------------------
    # 9. Check whether objective completed
    # -----------------------------------------------------

    if not evidence_result["progress"]["completed"]:

        objective_usage = _get_objective_usage(
            project_id=project_id,
            current_user=current_user,
        )

        return {
            "status": "evidence_recorded",
            "objective_completed": False,
            "evidence": evidence_result["evidence"],
            "objective": evidence_result["objective"],
            "progress": evidence_result["progress"],
            "transition": None,
            "objective_usage": objective_usage,
        }

    # -----------------------------------------------------
    # 10. Process completed objective
    # -----------------------------------------------------

    transition = DecisionService.process_objective_completion(
        project_id=project_id,
        objective_id=objective["id"],
        project=project,
    )

    # -----------------------------------------------------
    # 11. Get updated objective usage
    # -----------------------------------------------------

    objective_usage = _get_objective_usage(
        project_id=project_id,
        current_user=current_user,
    )

    # -----------------------------------------------------
    # 12. Return complete transition
    # -----------------------------------------------------

    return {
        "status": "objective_processed",
        "objective_completed": True,
        "evidence": evidence_result["evidence"],
        "objective": evidence_result["objective"],
        "progress": evidence_result["progress"],
        "transition": transition,
        "objective_usage": objective_usage,
    }