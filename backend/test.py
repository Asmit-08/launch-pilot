from repositories.repository_manager import audit_repository
from services.decision_service import DecisionService
from services.evidence_service import EvidenceService


PROJECT_ID = "92e416ad-d99b-49f1-85ce-2333bd469742"
USER_ID = "bbe75a3b-7eaf-46b8-a2f0-bce03ce3c927"


def main():

    # =========================================================
    # 1. FETCH PROJECT
    # =========================================================

    print("Fetching Plavtora project...")

    project = audit_repository.get_project_by_id(
        project_id=PROJECT_ID,
        user_id=USER_ID,
    )

    if project is None:
        raise RuntimeError("Plavtora project not found.")

    print("Project:")
    print(project)

    # =========================================================
    # 2. INITIALIZE V2
    # =========================================================

    print("\nInitializing V2 decision state...")

    audit_result = {
        "validation": {
            "score": 3,
        },
        "product": {
            "score": 8,
        },
        "launch_readiness": {
            "score": 7,
        },
        "risk": {
            "score": 5,
        },
    }

    initialization = DecisionService.initialize_project(
        project=project,
        audit_result=audit_result,
    )

    objective = initialization["objective"]

    print("\nInitial objective:")
    print(objective)

    if objective is None:
        raise RuntimeError(
            "Initialization did not return an objective."
        )

    # =========================================================
    # 3. RECORD FIRST EVIDENCE
    # =========================================================

    print("\nRecording first evidence...")

    first_result = EvidenceService.record_evidence(
        project_id=project["id"],
        kind="interview",
        source="founder_report",
        observed=(
            "3 target users independently reported "
            "the same startup decision-making problem."
        ),
        quality="repeated",
        n=3,
    )

    print("\nFirst evidence:")
    print(first_result["evidence"])

    print("\nProgress:")
    print(first_result["progress"])

    # =========================================================
    # 4. RECORD SECOND EVIDENCE
    # =========================================================
    #
    # Another 2 observations should bring the objective
    # from 3/5 to 5/5 and complete it.
    #

    print("\nRecording second evidence...")

    second_result = EvidenceService.record_evidence(
        project_id=project["id"],
        kind="interview",
        source="founder_report",
        observed=(
            "2 additional target users independently "
            "confirmed the same problem."
        ),
        quality="repeated",
        n=2,
    )

    print("\nSecond evidence:")
    print(second_result["evidence"])

    print("\nProgress:")
    print(second_result["progress"])

    completed_objective = second_result["objective"]

    # =========================================================
    # 5. PROCESS COMPLETED OBJECTIVE
    # =========================================================

    if not second_result["progress"]["completed"]:
        raise RuntimeError(
            "Objective was expected to be completed but is still active."
        )

    print("\nProcessing completed objective...")

    transition = DecisionService.process_objective_completion(
        project_id=project["id"],
        objective_id=completed_objective["id"],
    )

    # =========================================================
    # 6. PRINT TRANSITION
    # =========================================================

    print("\n========== FINAL V2 TRANSITION ==========")

    print("\nEVALUATION:")
    print(transition["evaluation"])

    print("\nUPDATED BELIEF:")
    print(transition["belief"])

    print("\nNEXT BELIEF:")
    print(transition["next_belief"])

    print("\nNEXT OBJECTIVE:")
    print(transition["next_objective"])

    print("\nSTATE:")
    print(transition["state"])

    print("\nDECISION:")
    print(transition["decision"])


if __name__ == "__main__":
    main()