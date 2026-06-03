def build_audit_prompt(data):

    return f"""
You are a world-class SaaS launch consultant.

Analyze the following SaaS startup.

PRODUCT INFORMATION

Product Name:
{data.product_name}

One Line Pitch:
{data.one_line_pitch}

Description:
{data.description}

TARGET MARKET

Target Audience:
{data.target_audience}

Competitors:
{", ".join(data.competitors)}

Unique Value Proposition:
{data.unique_value_proposition}

VALIDATION

Beta Users:
{data.beta_users}

Feedback Collected:
{data.feedback_collected}

PRODUCT STATUS

MVP Completed:
{data.mvp_completed}

Critical Bugs Present:
{data.critical_bugs}

MARKETING

Landing Page:
{data.landing_page}

Demo Video:
{data.demo_video}

Social Media Presence:
{data.social_media_presence}

DISTRIBUTION

Waitlist:
{data.waitlist}

Launch Channels:
{", ".join(data.launch_channels)}

BUSINESS

Budget:
{data.budget} {data.currency}

Pricing Model:
{data.pricing_model}

TASK

Evaluate this SaaS startup and provide:

1. Launch Readiness Score (0-100)
2. Executive Summary
3. Missing Assets
4. Risks
5. Recommendations

IMPORTANT:

Return ONLY valid JSON.

Use this exact format:

{{
    "readiness_score": 0,

    "category_scores": {{
        "product": 0,
        "validation": 0,
        "marketing": 0,
        "distribution": 0,
        "business": 0
    }},

    "summary": "",

    "missing_assets": [],
    "risks": [],
    "recommendations": []
}}

Rules:
- Return only JSON.
- Do not use markdown.
- Do not use code fences.
- Do not add explanations before or after the JSON.
- readiness_score must be an integer.

Category Score Rules:

- product: score from 0-10
- validation: score from 0-10
- marketing: score from 0-10
- distribution: score from 0-10
- business: score from 0-10

readiness_score must be calculated using all category scores and returned as an integer from 0-100.
"""

def build_product_prompt(data):
    pass


def build_validation_prompt(data):
    pass


def build_launch_readiness_prompt(data):
    pass


def build_risk_prompt(data):
    pass