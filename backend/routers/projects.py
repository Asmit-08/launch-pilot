from fastapi import APIRouter, Depends, HTTPException

from core.auth import get_current_user
from repositories.repository_manager import audit_repository


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# ---------------- Get All Projects ---------------- #

@router.get("")
def get_projects(
    current_user=Depends(get_current_user),
):
    projects = audit_repository.get_projects(
        current_user["id"]
    )

    return projects


# ---------------- Get Project By ID ---------------- #

@router.get("/{project_id}")
def get_project(
    project_id: str,
    current_user=Depends(get_current_user),
):
    project = audit_repository.get_project_by_id(
        project_id=project_id,
        user_id=current_user["id"],
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # Get audit history
    audit_sessions = audit_repository.get_audit_sessions(
        project_id=project_id
    )

    latest_audit = None

    if audit_sessions:
        latest_session = audit_sessions[0]

        audit_result = audit_repository.get_audit_result(
            audit_session_id=latest_session["id"]
        )

        if audit_result:
            latest_audit = {
                "session": latest_session,
                "result": audit_result,
            }

    return {
        "project": project,
        "latest_audit": latest_audit,
    }


# ---------------- Get Project Audit History ---------------- #

@router.get("/{project_id}/audits")
def get_project_audits(
    project_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------
    # Verify Project Ownership
    # -----------------------------------

    project = audit_repository.get_project_by_id(
        project_id=project_id,
        user_id=current_user["id"],
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # -----------------------------------
    # Get Audit Sessions
    # -----------------------------------

    audit_sessions = audit_repository.get_audit_sessions(
        project_id=project_id
    )

    audits = []

    # -----------------------------------
    # Get Results
    # -----------------------------------

    for session in audit_sessions:

        result = audit_repository.get_audit_result(
            audit_session_id=session["id"]
        )

        audits.append({
            "session": session,
            "result": result,
        })

    return audits


# ---------------- Get Single Project Audit ---------------- #

@router.get("/{project_id}/audits/{audit_id}")
def get_project_audit(
    project_id: str,
    audit_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------
    # Verify project ownership
    # -----------------------------------

    project = audit_repository.get_project_by_id(
        project_id=project_id,
        user_id=current_user["id"],
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    # -----------------------------------
    # Get audit result
    # -----------------------------------

    result = audit_repository.get_audit_result(
        audit_session_id=audit_id
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Audit not found",
        )

    # -----------------------------------
    # Make sure audit belongs to project
    # -----------------------------------

    sessions = audit_repository.get_audit_sessions(
        project_id=project_id
    )

    session = next(
        (
            item
            for item in sessions
            if item["id"] == audit_id
        ),
        None,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Audit not found for this project",
        )

    # -----------------------------------
    # Premium access
    # -----------------------------------

    subscription = current_user.get("subscription")

    has_premium_access = subscription in {
        "premium",
        "super_premium",
    }

    # -----------------------------------
    # Restrict premium detail fields
    # -----------------------------------

    if not has_premium_access:
        result = {
            **result,

            "product_json": {
                **(result.get("product_json") or {}),
                "strengths": [],
                "weaknesses": [],
            },

            "validation_json": {
                **(result.get("validation_json") or {}),
                "strengths": [],
                "weaknesses": [],
            },

            "launch_json": {
                **(result.get("launch_json") or {}),
                "strengths": [],
                "weaknesses": [],
            },

            "risk_json": {
                **(result.get("risk_json") or {}),
                "critical_risks": [],
                "mitigation": [],
            },
        }

    return {
        "project": project,
        "session": session,
        "result": result,
    }