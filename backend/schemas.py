from pydantic import BaseModel
from typing import List, Optional
from typing import Dict, Any
from pydantic import BaseModel

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