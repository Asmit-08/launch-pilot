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

    return f"""
You are an expert SaaS Product Strategist.

Analyze ONLY the product itself.

PRODUCT

Name:
{data.product_name}

Pitch:
{data.one_line_pitch}

Description:
{data.description}

Unique Value Proposition:
{data.unique_value_proposition}

MVP Completed:
{data.mvp_completed}

Critical Bugs:
{data.critical_bugs}

TASK

Evaluate:

1. Product quality
2. Value proposition clarity
3. Product readiness
4. Product strengths
5. Product weaknesses

Return ONLY valid JSON.

{{
    "score": 0,
    "strengths": [],
    "weaknesses": []
}}

Rules:
- score must be from 0-10
- return only JSON

IMPORTANT:

Ignore:
- Budget
- Marketing
- Launch channels
- Waitlist
- Social media presence
- Business risks

Analyze ONLY:
- Product quality
- Value proposition
- Product differentiation
- Product readiness

Scoring Guidelines

0-2 = Critical Failure

3-4 = Weak

5-6 = Average

7-8 = Strong

9-10 = Exceptional
"""


def build_validation_prompt(data):

    return f"""
You are an expert Startup Validation Analyst.

Analyze ONLY product validation.

VALIDATION DATA

Beta Users:
{data.beta_users}

Feedback Collected:
{data.feedback_collected}

IMPORTANT

Ignore:
- Budget
- Pricing
- Marketing
- Landing Page
- Demo Video
- Social Media
- Launch Channels
- Competition

Analyze ONLY:

1. Evidence of demand
2. Validation strength
3. Market confidence
4. Early user traction

Return ONLY valid JSON.

{{
    "score": 0,
    "strengths": [],
    "weaknesses": []
}}

Rules:
- score must be from 0 to 10
- return only JSON

Scoring Guidelines

0-2 = Critical Failure

3-4 = Weak

5-6 = Average

7-8 = Strong

9-10 = Exceptional
"""


def build_launch_readiness_prompt(data):

    return f"""
You are an expert SaaS Launch Strategist.

Analyze ONLY launch readiness.

LAUNCH READINESS DATA

Landing Page:
{data.landing_page}

Demo Video:
{data.demo_video}

Social Media Presence:
{data.social_media_presence}

Waitlist:
{data.waitlist}

Launch Channels:
{", ".join(data.launch_channels)}

IMPORTANT

Ignore:
- Product quality
- MVP status
- Beta users
- Budget
- Pricing model
- Competition

Analyze ONLY:

1. Launch readiness
2. Marketing asset readiness
3. Audience preparation
4. Distribution readiness

Return ONLY valid JSON.

{{
    "score": 0,
    "strengths": [],
    "weaknesses": []
}}

Rules:
- score must be from 0 to 10
- return only JSON

Scoring Guidelines

0-2 = Critical Failure

3-4 = Weak

5-6 = Average

7-8 = Strong

9-10 = Exceptional
"""


def build_risk_prompt(data):

    return f"""
You are an expert Startup Risk Analyst.

Analyze ONLY business and launch risks.

RISK DATA

Competitors:
{", ".join(data.competitors)}

Budget:
{data.budget} {data.currency}

Pricing Model:
{data.pricing_model}

IMPORTANT

Ignore:
- Product quality
- MVP status
- Beta users
- Feedback
- Landing page
- Demo video
- Social media
- Waitlist
- Launch channels

Analyze ONLY:

1. Business risks
2. Competitive risks
3. Financial risks
4. Monetization risks

Return ONLY valid JSON.

{{
    "score": 0,
    "critical_risks": [],
    "mitigation": []
}}

Rules:
- score must be from 0 to 10
- Higher score = lower overall risk
- Return only JSON

Scoring Guidelines

0-2 = Critical Failure

3-4 = Weak

5-6 = Average

7-8 = Strong

9-10 = Exceptional
"""