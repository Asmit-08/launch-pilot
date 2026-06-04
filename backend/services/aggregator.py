def aggregate_results(
    product_result,
    validation_result,
    launch_result,
    risk_result
):

    overall_score = round(
        (
            product_result["score"] * 0.35 +
            validation_result["score"] * 0.20 +
            launch_result["score"] * 0.25 +
            risk_result["score"] * 0.20
        ) * 10
    )

    return {
        "overall_score": overall_score,
        "product": product_result,
        "validation": validation_result,
        "launch_readiness": launch_result,
        "risk": risk_result
    }