from supabase import Client


class AuditRepository:
    def __init__(self, client: Client):
        self.client = client

    # ---------------- Projects ---------------- #

    def create_project(
        self,
        user_id: str,
        name: str,
        description: str | None = None,
        website: str | None = None,
        industry: str | None = None,
        stage: str | None = None,
    ):
        response = (
            self.client
            .table("projects")
            .insert({
                "user_id": user_id,
                "name": name,
                "description": description,
                "website": website,
                "industry": industry,
                "stage": stage,
                "is_archived": False,
            })
            .execute()
        )

        return response.data[0]

    def get_project_by_name(
        self,
        user_id: str,
        name: str,
    ):
        response = (
            self.client
            .table("projects")
            .select("*")
            .eq("user_id", user_id)
            .eq("name", name)
            .eq("is_archived", False)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    # ---------------- Audit Sessions ---------------- #

    def create_audit_session(
    self,
    project_id: str,
    audit_type: str = "launch_audit",
    status: str = "completed",
):
        response = (
            self.client
            .table("audit_sessions")
            .insert({
                "project_id": project_id,
                "audit_type": audit_type,
                "status": status,
            })
            .execute()
        )


        return response.data[0]

    def get_audit_sessions(
        self,
        project_id: str,
    ):
        response = (
            self.client
            .table("audit_sessions")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    # ---------------- Audit Results ---------------- #

    def create_audit_result(
        self,
        audit_session_id: str,
        overall_score: int,
        product_json: dict,
        validation_json: dict,
        launch_json: dict,
        risk_json: dict,
    ):
        response = (
            self.client
            .table("audit_results")
            .insert({
                "audit_session_id": audit_session_id,
                "overall_score": overall_score,
                "product_json": product_json,
                "validation_json": validation_json,
                "launch_json": launch_json,
                "risk_json": risk_json,
            })
            .execute()
        )

        return response.data[0]

    def get_audit_result(
        self,
        audit_session_id: str,
    ):
        response = (
            self.client
            .table("audit_results")
            .select("*")
            .eq("audit_session_id", audit_session_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]