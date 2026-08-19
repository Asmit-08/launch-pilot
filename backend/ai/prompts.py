def build_combined_audit_prompt(data):
    return f"""
You are Plavtora's startup analysis engine.

Perform a comprehensive startup audit using FOUR independent analytical perspectives:

1. PRODUCT
2. VALIDATION
3. LAUNCH READINESS
4. RISK

This is ONE AI call, but you must perform all four analyses independently.

IMPORTANT RULES:

- Be critical and evidence-based.
- Do not blindly agree with the founder.
- Do not invent customers, revenue, traction, market demand, interviews, testimonials, or other evidence.
- A completed MVP is NOT proof of market validation.
- A founder's claim of differentiation is NOT automatically meaningful differentiation.
- Boolean fields represent what the founder reports; do not treat them as independently verified facts.
- Missing evidence should reduce confidence where appropriate.
- Do not allow a strong result in one category to artificially inflate another category.
- Give practical, specific findings rather than generic startup advice.
- Return ONLY valid JSON.
- Do NOT wrap the response in Markdown or ```json.


==================================================
STARTUP INFORMATION
==================================================

Product name:
{data.product_name}

One-line pitch:
{data.one_line_pitch}

Description:
{data.description}

Target audience:
{data.target_audience}

Competitors:
{data.competitors}

Unique value proposition:
{data.unique_value_proposition}


VALIDATION

Beta users:
{data.beta_users}

Feedback collected:
{data.feedback_collected}


PRODUCT STATUS

MVP completed:
{data.mvp_completed}

Critical bugs:
{data.critical_bugs}


MARKETING

Landing page:
{data.landing_page}

Demo video:
{data.demo_video}

Social media presence:
{data.social_media_presence}


DISTRIBUTION

Waitlist:
{data.waitlist}

Launch channels:
{data.launch_channels}


BUSINESS

Budget:
{data.budget} {data.currency}

Pricing model:
{data.pricing_model}


==================================================
1. PRODUCT ANALYSIS
==================================================

Analyze the actual product proposition.

Evaluate:

- Problem/value clarity based on the provided description
- One-line pitch clarity
- Value proposition
- Product usefulness
- Differentiation from stated competitors
- Whether the UVP appears meaningful
- Product readiness
- MVP completeness
- Critical product weaknesses
- Whether the product appears capable of solving the stated user problem

Pay particular attention to:

- vague positioning
- weak differentiation
- unclear value
- feature-over-problem thinking
- obvious competitive substitutes

Do not invent information about competitors that was not provided.

Return exactly:

"product": {{
    "score": integer from 0 to 10,
    "strengths": [
        "specific strength"
    ],
    "weaknesses": [
        "specific weakness"
    ]
}}


==================================================
2. VALIDATION ANALYSIS
==================================================

Analyze ONLY evidence that the market may actually want this product.

Evaluate:

- Number of beta users
- Whether feedback has been collected
- Strength of the available validation evidence
- Whether the evidence demonstrates demand
- Whether validation is still mostly assumption-driven
- Whether there is evidence of real user engagement

Important:

- Beta users alone are not equivalent to paying customers.
- Feedback collection is not equivalent to positive validation.
- An MVP being completed is not validation.
- Do not invent revenue, retention, customers, interviews, testimonials, or pre-orders.

Return exactly:

"validation": {{
    "score": integer from 0 to 10,
    "strengths": [
        "specific validation strength"
    ],
    "weaknesses": [
        "specific validation weakness"
    ]
}}


==================================================
3. LAUNCH READINESS ANALYSIS
==================================================

Evaluate whether the startup is realistically prepared to launch.

Consider:

- MVP completion
- Critical bugs
- Landing page
- Demo video
- Social media presence
- Waitlist
- Launch channels
- Target audience clarity
- Positioning
- Available budget
- Pricing model
- Ability to acquire initial users

Distinguish between:

PRODUCT READINESS
and
GO-TO-MARKET READINESS.

A completed MVP does not automatically mean the startup is launch-ready.

Identify the most important missing launch components.

Return exactly:

"launch_readiness": {{
    "score": integer from 0 to 10,
    "strengths": [
        "specific launch strength"
    ],
    "weaknesses": [
        "specific launch weakness"
    ]
}}


==================================================
4. RISK ANALYSIS
==================================================

Identify the most important risks that could prevent this startup from succeeding.

Consider:

- Product risk
- Market/validation risk
- Competitive risk
- Differentiation risk
- Customer acquisition risk
- Monetization risk
- Financial/budget risk
- Execution risk
- Technical/product readiness risk

Prioritize the most consequential risks.

Do NOT generate generic statements such as:
"Competition is a risk."

Instead explain the actual risk in the context of the supplied startup information.

For example:

Weak:
"Customer acquisition may be difficult."

Better:
"The startup currently has no waitlist and no stated launch channel beyond social media, making the initial customer acquisition path uncertain."

For mitigation:

- Give a practical action that directly addresses the corresponding risk.
- Keep mitigations specific and executable.

Return exactly:

"risk": {{
    "score": integer from 0 to 10,
    "critical_risks": [
        "specific critical risk"
    ],
    "mitigation": [
        "specific mitigation corresponding to the identified risks"
    ]
}}


==================================================
FINAL OUTPUT
==================================================

Return exactly this JSON structure:

{{
    "product": {{
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }},
    "validation": {{
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }},
    "launch_readiness": {{
        "score": 0,
        "strengths": [],
        "weaknesses": []
    }},
    "risk": {{
        "score": 0,
        "critical_risks": [],
        "mitigation": []
    }}
}}

All scores must be integers between 0 and 10.
Do not add additional top-level fields.
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