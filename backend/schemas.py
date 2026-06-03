from pydantic import BaseModel
from typing import List

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