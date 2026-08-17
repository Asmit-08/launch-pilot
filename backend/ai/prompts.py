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

SCORING RUBRIC

0-2 = Critical failure
The startup has severe unresolved issues and is unlikely to succeed without major changes.

3-4 = Weak
Some progress exists, but significant deficiencies remain.

5-6 = Average
Reasonable progress with both strengths and weaknesses.

7-8 = Strong
Well-prepared with only a few important gaps.

9-10 = Exceptional
Highly prepared with strong evidence and minimal weaknesses.

IMPORTANT:

A startup with:
- MVP completed
- active beta users
- collected feedback

should generally not receive a score below 5 in validation.

A startup with:
- a functioning product
- some traction
- identifiable risks

should generally not receive a risk score below 3 unless survival is immediately threatened.
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

SCORING RUBRIC

0-2 = Critical failure
The startup has severe unresolved issues and is unlikely to succeed without major changes.

3-4 = Weak
Some progress exists, but significant deficiencies remain.

5-6 = Average
Reasonable progress with both strengths and weaknesses.

7-8 = Strong
Well-prepared with only a few important gaps.

9-10 = Exceptional
Highly prepared with strong evidence and minimal weaknesses.

IMPORTANT:

A startup with:
- MVP completed
- active beta users
- collected feedback

should generally not receive a score below 5 in validation.

A startup with:
- a functioning product
- some traction
- identifiable risks

should generally not receive a risk score below 3 unless survival is immediately threatened.
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

SCORING RUBRIC

0-2 = Critical failure
The startup has severe unresolved issues and is unlikely to succeed without major changes.

3-4 = Weak
Some progress exists, but significant deficiencies remain.

5-6 = Average
Reasonable progress with both strengths and weaknesses.

7-8 = Strong
Well-prepared with only a few important gaps.

9-10 = Exceptional
Highly prepared with strong evidence and minimal weaknesses.

IMPORTANT:

A startup with:
- MVP completed
- active beta users
- collected feedback

should generally not receive a score below 5 in validation.

A startup with:
- a functioning product
- some traction
- identifiable risks

should generally not receive a risk score below 3 unless survival is immediately threatened.
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

IMPORTANT RISK ANALYSIS RULES

1. Evaluate the severity of current business risks, NOT the probability that the startup succeeds or fails.

2. Do not assume a startup will fail simply because:
   - the budget is small
   - competitors exist
   - the startup is early-stage
   - user numbers are currently low

3. Early-stage startups are expected to have:
   - limited budgets
   - small beta user groups
   - incomplete marketing assets
   These factors alone should not automatically result in a critical score.

4. Focus on:
   - financial risks
   - competitive risks
   - monetization risks
   - business execution risks

5. Competitors should only be considered a major risk if they solve the same primary problem for the same target audience.

6. Every critical risk must have a realistic mitigation strategy.

SCORING RUBRIC

0-2 = Critical risks threatening immediate viability
3-4 = High risks requiring urgent attention
5-6 = Manageable risks with clear mitigation paths
7-8 = Low risks
9-10 = Minimal risks

IMPORTANT:

A startup that has:
- a completed MVP
- some user validation
- a defined target audience

should generally not receive a score below 3 unless there is an immediate existential threat.
"""

def build_persona_prompt(data):
    additional_details = data.additional_details or "None provided."

    return f"""
You are a senior startup marketing strategist and ICP analyst.

A founder is building:
{data.what_are_you_building}

Product description:
{data.product_description}

Additional details (optional):
{additional_details}

Your task is to identify the strongest and most commercially relevant primary customer persona for this product and produce a complete ICP analysis.

Analyze:
- the product's value proposition
- the problem being solved
- likely customer segments
- urgency and frequency of the problem
- pain intensity
- willingness to pay
- product-persona fit
- customer specificity
- accessibility of the customer
- commercial potential

You must generate the complete analysis in ONE response.

Return ONLY valid JSON.
Do not use markdown fences.
Do not include a preamble.
Do not include explanations outside the JSON.

Return EXACTLY this structure:

{{
    "confidence_score": 0,
    "executive_summary": "string",
    "ideal_customer_profile": "string",
    "persona": {{
        "name": "string",
        "age_range": "string",
        "occupation": "string",
        "description": "string"
    }},
    "pain_points": ["string"],
    "goals": ["string"],
    "motivations": ["string"],
    "buying_triggers": ["string"],
    "buying_behaviour": "string",
    "common_objections": ["string"],
    "marketing_channels": ["string"],
    "messaging_recommendations": ["string"],
    "content_ideas": ["string"]
}}

CONFIDENCE SCORE RULES:

"confidence_score" must be an integer from 0 to 100.

The confidence score represents how confidently the available product information supports the identified ICP and persona.

Evaluate the confidence using these factors:

1. Problem relevance — Does the product solve a meaningful problem for this customer?
2. Pain intensity — How significant and frequent is the problem?
3. Specificity — Can the customer be clearly defined rather than being a broad market?
4. Willingness to pay — Is this customer reasonably likely to pay for a solution?
5. Product-persona fit — Does the product naturally fit this customer's workflow and needs?
6. Accessibility — Can this customer reasonably be reached through identifiable channels?
7. Commercial potential — Is this sufficiently valuable as a customer segment to build a business around?

The score is NOT the probability that the customer will purchase.

PERSONA RULES:

Identify ONE primary persona.

Do not list multiple personas.

The persona should represent a realistic individual within the strongest ICP.

"name" should be a memorable persona label, for example:
"Sarah the Solo-Creative"
"Mike the Agency Founder"
"Alex the Technical Freelancer"

"age_range" should be a realistic estimated range.

"occupation" should describe the person's actual role or type of business.

"description" should explain:
- who this person is
- what stage they are at
- what situation they are currently facing
- why this product is relevant to them

EXECUTIVE SUMMARY RULES:

Write a concise strategic summary explaining:

- who the product primarily targets
- what situation or problem defines this customer
- why the product is relevant to them

Keep it specific and commercially useful.

IDEAL CUSTOMER PROFILE RULES:

Describe the broader ideal customer segment represented by the persona.

Include relevant characteristics such as:
- business type
- company/team size
- experience or maturity
- approximate economic profile when reasonably inferable
- current workflow or tools
- characteristics that make them especially suitable for the product

Do not invent highly specific facts that cannot reasonably be inferred from the product information.

PAIN POINT RULES:

Identify the most important problems this customer experiences that the product can realistically address.

Prioritize concrete, recurring problems over generic statements.

GOAL RULES:

Identify the outcomes the customer wants to achieve by solving those problems.

MOTIVATION RULES:

Identify the underlying reasons that make solving the problem important to the customer.

BUYING TRIGGER RULES:

Identify realistic events or situations that could cause this customer to actively search for a solution.

BUYING BEHAVIOUR RULES:

Describe how this customer is likely to evaluate and purchase a product like this, including relevant preferences around pricing, onboarding, trust, trials, recommendations, or implementation.

COMMON OBJECTION RULES:

Identify realistic reasons this customer might hesitate to purchase or switch from their current solution.

MARKETING CHANNEL RULES:

Identify channels and communities where this specific customer is realistically reachable.

Avoid generic recommendations such as simply saying "social media."

MESSAGING RECOMMENDATION RULES:

Provide concise messaging angles that directly connect the product's value to this customer's problems and desired outcomes.

CONTENT IDEA RULES:

Provide practical content ideas that would attract, educate, or convert this specific customer.

QUALITY RULES:

- Do not invent information that is unsupported by the product description unless it is a reasonable inference.
- Prefer specificity over generic marketing language.
- Avoid describing "everyone who could use the product" as the ICP.
- Identify the strongest primary customer segment.
- Keep the persona realistic rather than aspirational.
- Ensure all fields are internally consistent.
- Ensure the persona, ICP, pain points, goals, buying triggers, messaging, and content ideas describe the same customer.

Return ONLY the JSON object.
"""


def build_landing_page_prompt(
    page_data: dict,
    icp_context: dict | None = None,
):
    return f"""
You are Plavtora's Landing Page Analyzer.

Your job is to evaluate a SaaS landing page from two strictly
separate perspectives:

1. GENERAL LANDING PAGE QUALITY
2. ICP ALIGNMENT

These evaluations MUST remain independent.

==================================================
CORE PRINCIPLE
==================================================

GENERAL LANDING PAGE QUALITY answers:

"How effectively does this landing page communicate and convert
the audience that the page itself appears to target?"

ICP ALIGNMENT answers:

"How well does this landing page align with the explicitly
provided ICP context for the CURRENT project?"

An ICP mismatch MUST NOT reduce the general landing-page score.

For example:

A landing page may be extremely strong for enterprise buyers while
the provided ICP describes solo founders.

The correct result could therefore be:

- Overall landing-page quality: 9/10
- Messaging: 9/10
- Trust: 9/10
- ICP alignment: 2/10

The page can be excellent while being poorly aligned with the
provided ICP.

==================================================
LANDING PAGE DATA
==================================================

URL:
{page_data.get("url", "")}

TITLE:
{page_data.get("title", "")}

HEADINGS:
{page_data.get("headings", [])}

PAGE CONTENT:
{page_data.get("text", "")}

==================================================
ICP CONTEXT
==================================================

The following ICP context is supplied by Plavtora for the CURRENT
analysis.

Treat this information as external input.

DO NOT:

- invent missing ICP attributes
- assume unstated ICP characteristics
- retrieve ICP information from memory
- use information from previous analyses
- use information from another project
- infer that an unrelated persona belongs to this project
- merge multiple ICPs together
- modify the supplied ICP to make it fit the landing page

ICP CONTEXT:

{icp_context if icp_context else "NO ICP CONTEXT PROVIDED"}

==================================================
ICP CONTEXT INTEGRITY
==================================================

Before evaluating ICP alignment, determine whether usable ICP
information is actually present.

A usable ICP should contain at least some explicit information
about the intended customer, such as:

- customer type
- target audience
- customer role
- company type
- industry
- primary problem
- desired outcome
- buying motivation

Do NOT require every attribute to be present.

If the supplied ICP contains only vague or insufficient information,
state that ICP alignment cannot be confidently determined.

If no ICP context is provided:

- Set icp_alignment.score to 0.
- State that ICP alignment is unavailable because no ICP context
  was provided.
- Do NOT infer an ICP from the landing page and pretend it is the
  saved ICP.
- Do NOT penalize overall_score.

==================================================
GENERAL LANDING PAGE QUALITY
==================================================

Evaluate the landing page independently of the ICP.

Evaluate:

- Value proposition clarity
- Messaging quality
- Positioning
- CTA effectiveness
- Trust and credibility
- Conversion clarity
- Offer clarity
- Audience clarity
- Strength of the primary value proposition
- Ability to communicate a compelling reason to act
- Overall conversion effectiveness

Judge the page according to the audience it appears to target.

The overall_score MUST represent GENERAL LANDING PAGE QUALITY.

The overall_score MUST NOT be reduced because:

- The page targets a different audience than the supplied ICP.
- The ICP is unavailable.
- The ICP is incomplete.
- The page does not match the supplied ICP.
- The model cannot verify the ICP independently.

==================================================
ICP ALIGNMENT
==================================================

Evaluate ONLY the relationship between:

A. The audience and positioning explicitly represented by the
   landing page

AND

B. The supplied ICP context.

Evaluate:

- Target customer
- Customer role
- Company or business type
- Industry/context
- Pain points
- Desired outcomes
- Buying motivations
- Value proposition
- Messaging
- Positioning
- Benefits
- Offer
- Language used by the page

For each conclusion, rely on observable evidence from either:

- the landing-page content
- the supplied ICP context

Do not fabricate evidence.

==================================================
ICP ALIGNMENT METHODOLOGY
==================================================

First identify the audience represented by the landing page.

Clearly distinguish between:

EXPLICIT:
Information directly stated on the landing page.

INFERRED:
Audience characteristics reasonably inferred from the page.

Do not present inferred characteristics as facts.

Then compare that audience against the supplied ICP.

Look for:

1. CUSTOMER MATCH
Does the page appear to target the same type of customer?

2. PROBLEM MATCH
Does the page address problems relevant to the ICP?

3. OUTCOME MATCH
Does the page promise outcomes the ICP actually wants?

4. POSITIONING MATCH
Is the product positioned in a way that makes sense for the ICP?

5. LANGUAGE MATCH
Does the terminology and framing resonate with the ICP?

6. OFFER MATCH
Does the offer make sense for the ICP's likely needs and
buying motivations?

==================================================
ICP SCORE
==================================================

Score ICP alignment from 0 to 10.

Use:

9-10 = Exceptional alignment
7-8  = Strong alignment
5-6  = Partial/moderate alignment
3-4  = Weak alignment
1-2  = Very weak alignment
0    = Alignment cannot be assessed because usable ICP context
       is unavailable

IMPORTANT:

A low ICP alignment score does NOT mean the landing page is bad.

It means the landing page is poorly aligned with the supplied ICP.

If the landing page clearly targets a different customer than the
supplied ICP, explicitly identify:

- who the landing page appears to target
- who the supplied ICP describes
- the specific areas of mismatch

==================================================
EVIDENCE REQUIREMENT
==================================================

ICP conclusions must be grounded in evidence.

Good:

"The page repeatedly addresses solo founders, while the supplied
ICP describes enterprise SaaS teams. This creates a customer-type
mismatch."

Bad:

"The ICP probably wants enterprise security features."

The second statement is invalid unless that requirement is present
in the supplied ICP or otherwise directly supported by the
provided data.

Do not invent customer motivations, demographics, budgets,
industries, company sizes, or pain points.

==================================================
CROSS-PROJECT CONTEXT PROTECTION
==================================================

The supplied ICP is ONLY the ICP provided in this prompt.

You must NEVER:

- recall a previous ICP
- reuse an ICP from another analysis
- combine the supplied ICP with another persona
- reference previous users or projects
- assume that a persona belongs to the current project unless it
  appears in the supplied ICP context

If the supplied ICP appears unrelated to the landing page, report
the mismatch.

Do NOT silently replace the supplied ICP with an inferred or
previous ICP.

==================================================
GENERAL RULES
==================================================

- Do not invent information.
- Do not fabricate testimonials, customers, metrics, logos,
  partnerships, or evidence.
- Do not assume traffic, revenue, conversion rates, customers,
  users, or other metrics unless explicitly provided.
- Only evaluate information present in the supplied data.
- Do not penalize the page for information that cannot reasonably
  be determined from the extracted content.
- Distinguish observed weaknesses from recommendations.
- Recommendations must be based on observed weaknesses.
- Keep general landing-page quality separate from ICP alignment.
- ICP mismatch MUST NEVER directly lower overall_score.
- Do not use ICP information to judge general landing-page quality.
- Do not use general landing-page quality to artificially inflate
  ICP alignment.
- If evidence is insufficient, explicitly say so.
- Return ONLY valid JSON.
- Do not wrap the JSON in markdown code fences.

==================================================
SCORING
==================================================

All available scores must be integers from 0 to 10.

General interpretation:

0-2 = Extremely weak
3-4 = Weak
5-6 = Average
7-8 = Strong
9-10 = Exceptional

The overall_score must represent general landing-page quality.

It should generally be consistent with the category scores.

Do not arbitrarily produce a low overall score when most category
scores are strong.

==================================================
FREE VS PREMIUM
==================================================

The complete analysis will be generated internally.

Free users will receive:

- overall_score
- executive_summary
- messaging

Premium users will receive the complete analysis.

Do not omit Premium fields from the generated JSON.

==================================================
OUTPUT FORMAT
==================================================

Return exactly this JSON structure:

{{
    "overall_score": 0,

    "executive_summary": "",

    "value_proposition": {{
        "score": 0,
        "summary": ""
    }},

    "messaging": {{
        "score": 0,
        "summary": ""
    }},

    "cta": {{
        "score": 0,
        "summary": ""
    }},

    "trust": {{
        "score": 0,
        "summary": ""
    }},

    "conversion_clarity": {{
        "score": 0,
        "summary": ""
    }},

    "icp_alignment": {{
        "score": 0,
        "summary": ""
    }},

    "conversion_problems": [],

    "recommendations": []
}}
"""