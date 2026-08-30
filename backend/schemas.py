from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# =========================
# EXISTING SCHEMAS
# =========================

class LaunchAuditRequest(BaseModel):

    # Product
    product_name: str
    one_line_pitch: str
    description: str

    # Market
    target_audience: str
    competitors: List[str]
    unique_value_proposition: str

    # Validation
    beta_users: int
    feedback_collected: bool

    # Product Status
    mvp_completed: bool
    critical_bugs: bool

    # Marketing
    landing_page: bool
    demo_video: bool
    social_media_presence: bool

    # Distribution
    waitlist: bool
    launch_channels: List[str]

    # Business
    budget: int
    currency: str
    pricing_model: str


class ChatRequest(BaseModel):
    message: str
    audit_result: Dict[str, Any]
    startup_data: Dict[str, Any]
    chat_history: List[Dict[str, str]] = []


class PersonaRequest(BaseModel):
    what_are_you_building: str
    product_description: str
    additional_details: Optional[str] = None


class LandingPageRequest(BaseModel):
    url: str
    use_saved_icp: bool = False


# =========================
# PLAVTORA V2 SCHEMAS
# =========================

class StartupStateResponse(BaseModel):
    project_id: str
    stage: str
    one_liner: str
    current_constraint_belief_id: Optional[str] = None
    why_this_constraint: Optional[str] = None
    active_objective_id: Optional[str] = None
    active_experiment_id: Optional[str] = None
    updated_at: str


class BeliefResponse(BaseModel):
    id: str
    project_id: str
    claim: str
    type: str
    status: str
    confidence: int
    evidence_ids: List[str]
    last_changed_at: str
    created_at: str


class EvidenceResponse(BaseModel):
    id: str
    project_id: str
    kind: str
    source: str
    n: int
    observed: str
    quality: str
    supports: List[str]
    contradicts: List[str]
    collected_at: str
    created_at: str


class ObjectiveResponse(BaseModel):
    id: str
    project_id: str
    constraint_belief_id: str
    text: str
    action: str
    target_count: int
    evidence_kind: str
    success_criteria: str
    failure_criteria: str
    do_not_do: str
    status: str
    created_at: str
    due_at: str
    completed_at: Optional[str] = None


class ObjectiveOutcomeRequest(BaseModel):
    completion_status: str
    quantity: int
    observations: str
    evidence: Optional[str] = None
    user_interpretation: Optional[str] = None
    unexpected_result: Optional[str] = None


class DecisionResponse(BaseModel):
    id: str
    project_id: str
    type: str
    from_belief_id: Optional[str] = None
    to_belief_id: Optional[str] = None
    evidence_ids: List[str]
    human_override: bool
    override_note: Optional[str] = None
    created_at: str


class StateEventResponse(BaseModel):
    id: str
    project_id: str
    type: str
    payload: Dict[str, Any]
    created_at: str