from fastapi import APIRouter
from schemas import LaunchAuditRequest
from services.audit_service import AuditService
from ai.agents import product_agent, validation_agent, launch_readiness_agent, risk_agent

router = APIRouter()

@router.post("/audit")
def audit(data: LaunchAuditRequest):
    
    result = AuditService.generate_audit(data)

    return result

@router.post("/product-agent")
def test_product_agent(data: LaunchAuditRequest):

    return product_agent(data)

@router.post("/validation-agent")
def test_validation_agnet(data: LaunchAuditRequest):
    
    return validation_agent(data)

@router.post("/launch-readiness-agent")
def test_launch_readiness_agent(data: LaunchAuditRequest):

    return launch_readiness_agent(data)

@router.post("/risk-agent")
def test_risk_agent(data: LaunchAuditRequest):

    return risk_agent(data)