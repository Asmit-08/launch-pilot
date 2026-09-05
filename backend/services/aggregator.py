def aggregate_results(
    product_result,
    validation_result,
    launch_result,
    risk_result,
):

    results = {
        "product": product_result,
        "validation": validation_result,
        "launch_readiness": launch_result,
        "risk": risk_result,
    }

    # ---------------------------------------------------------
    # Validate and normalize agent outputs
    # ---------------------------------------------------------

    for section_name, section in results.items():

        if not isinstance(section, dict):
            raise ValueError(
                f"{section_name} result is not a valid object"
            )

        if "score" not in section:
            raise ValueError(
                f"{section_name} result is missing score"
            )

        score = section["score"]

        if not isinstance(score, (int, float)) or isinstance(score, bool):
            raise ValueError(
                f"{section_name} score must be a number"
            )

        if not 0 <= score <= 10:
            raise ValueError(
                f"{section_name} score must be between 0.0 and 10.0"
            )

        # Normalize every dimension score to one decimal place
        section["score"] = round(float(score), 1)

    # ---------------------------------------------------------
    # Overall score
    # ---------------------------------------------------------

    overall_score = round(
        (
            product_result["score"] * 0.35
            + validation_result["score"] * 0.20
            + launch_result["score"] * 0.25
            + risk_result["score"] * 0.20
        ) * 10,
        1,
    )

    # ---------------------------------------------------------
    # Priority actions
    #
    # These are derived from the existing audit findings.
    # No additional AI call is required.
    # ---------------------------------------------------------

    priority_actions = []

    # Collect weaknesses from all sections
    product_weaknesses = product_result.get(
        "weaknesses",
        []
    )

    validation_weaknesses = validation_result.get(
        "weaknesses",
        []
    )

    launch_weaknesses = launch_result.get(
        "weaknesses",
        []
    )

    critical_risks = risk_result.get(
        "critical_risks",
        []
    )

    # ---------------------------------------------------------
    # Find weakest dimensions
    # ---------------------------------------------------------

    dimensions = [
        {
            "name": "Product",
            "key": "product",
            "score": product_result["score"],
            "weaknesses": product_weaknesses,
        },
        {
            "name": "Validation",
            "key": "validation",
            "score": validation_result["score"],
            "weaknesses": validation_weaknesses,
        },
        {
            "name": "Launch Readiness",
            "key": "launch_readiness",
            "score": launch_result["score"],
            "weaknesses": launch_weaknesses,
        },
        {
            "name": "Risk",
            "key": "risk",
            "score": risk_result["score"],
            "weaknesses": critical_risks,
        },
    ]

    dimensions.sort(
        key=lambda item: item["score"]
    )

    # ---------------------------------------------------------
    # Action generator
    # ---------------------------------------------------------

    def build_action(dimension):

        name = dimension["name"]
        score = dimension["score"]
        weaknesses = dimension["weaknesses"]

        first_weakness = (
            weaknesses[0]
            if weaknesses
            else None
        )

        if isinstance(first_weakness, dict):
            finding = (
                first_weakness.get("description")
                or first_weakness.get("risk")
                or first_weakness.get("title")
                or first_weakness.get("risk_type")
                or str(first_weakness)
            )
        else:
            finding = str(first_weakness) if first_weakness else (
                f"{name} is currently scoring {score}/10."
            )

        if name == "Validation":
            return {
                "dimension": "Validation",
                "action": (
                    "Run a focused validation experiment "
                    "with real target users before increasing "
                    "acquisition or development effort."
                ),
                "why": finding,
                "measure": (
                    "Track retention, repeated usage, "
                    "conversion, and willingness to pay."
                ),
            }

        if name == "Product":
            return {
                "dimension": "Product",
                "action": (
                    "Identify and test the strongest "
                    "differentiating product outcome with "
                    "a small group of target users."
                ),
                "why": finding,
                "measure": (
                    "Measure whether users choose the "
                    "product for the differentiated outcome "
                    "and continue using it."
                ),
            }

        if name == "Launch Readiness":
            return {
                "dimension": "Launch Readiness",
                "action": (
                    "Run a small, measurable launch experiment "
                    "before committing significant acquisition budget."
                ),
                "why": finding,
                "measure": (
                    "Track qualified visitors, activation, "
                    "conversion, and acquisition cost."
                ),
            }

        # Risk
        return {
            "dimension": "Risk",
            "action": (
                "Address the highest-impact identified risk "
                "before scaling the activities that depend on it."
            ),
            "why": finding,
            "measure": (
                "Define a concrete risk threshold and verify "
                "that the risk decreases after the mitigation."
            ),
        }

    # ---------------------------------------------------------
    # Generate up to 3 prioritized actions
    # ---------------------------------------------------------

    for dimension in dimensions:

        if len(priority_actions) >= 3:
            break

        action = build_action(dimension)

        priority_actions.append({
            "priority": len(priority_actions) + 1,
            **action,
        })

    # ---------------------------------------------------------
    # Final aggregated result
    # ---------------------------------------------------------

    return {
        "overall_score": overall_score,

        "priority_actions": priority_actions,

        "product": product_result,

        "validation": validation_result,

        "launch_readiness": launch_result,

        "risk": risk_result,
  }

