from fastapi import APIRouter
from backend.schemas import LaunchAuditRequest
from backend.services.audit_service import AuditService

router = APIRouter()

@router.post("/audit")
def audit(data: LaunchAuditRequest):
    
    result = AuditService.generate_audit(data)

    return result