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

    for section_name, section in results.items():

        if not isinstance(section, dict):
            raise ValueError(
                f"{section_name} result is not a valid object"
            )

        if "score" not in section:
            raise ValueError(
                f"{section_name} result is missing score"
            )

        if not isinstance(section["score"], int):
            raise ValueError(
                f"{section_name} score must be an integer"
            )

        if not 0 <= section["score"] <= 10:
            raise ValueError(
                f"{section_name} score must be between 0 and 10"
            )

    overall_score = round(
        (
            product_result["score"] * 0.35
            + validation_result["score"] * 0.20
            + launch_result["score"] * 0.25
            + risk_result["score"] * 0.20
        ) * 10
    )

    return {
        "overall_score": overall_score,
        "product": product_result,
        "validation": validation_result,
        "launch_readiness": launch_result,
        "risk": risk_result,
    }