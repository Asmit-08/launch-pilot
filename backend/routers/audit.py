from fastapi import APIRouter, Depends

from core.auth import get_current_user
from schemas import LaunchAuditRequest

from services.audit_service import AuditService
from services.usage_service import usage_service


router = APIRouter()


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
    # This performs ONE Gemini request.
    # AI usage is recorded inside AuditService.

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