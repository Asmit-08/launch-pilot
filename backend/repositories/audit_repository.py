import time

import httpx
from supabase import Client


class AuditRepository:

    def __init__(self, client: Client):
        self.client = client

    # ---------------- Internal Helpers ---------------- #

    def _execute_with_retry(
        self,
        query,
        retries: int = 2,
        delay: float = 0.3,
    ):
        """
        Execute a Supabase read query with limited retry handling.

        This is intended for transient network/read failures.
        We retry reads because repeating them is safe.

        We intentionally do NOT use this for inserts.
        """

        for attempt in range(retries + 1):

            try:
                return query.execute()

            except (
                httpx.ReadError,
                httpx.ConnectError,
                httpx.RemoteProtocolError,
            ) as e:

                if attempt >= retries:
                    raise

                print(
                    f"Supabase read failed "
                    f"(attempt {attempt + 1}/{retries + 1}): {e}"
                )

                time.sleep(delay * (attempt + 1))

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
        query = (
            self.client
            .table("projects")
            .select("*")
            .eq("user_id", user_id)
            .eq("name", name)
            .eq("is_archived", False)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_project_by_id(
        self,
        project_id: str,
        user_id: str,
    ):
        query = (
            self.client
            .table("projects")
            .select("*")
            .eq("id", project_id)
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

    def get_projects(
        self,
        user_id: str,
    ):
        query = (
            self.client
            .table("projects")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .order("updated_at", desc=True)
        )

        response = self._execute_with_retry(query)

        return response.data

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
        query = (
            self.client
            .table("audit_sessions")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
        )

        response = self._execute_with_retry(query)

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
        query = (
            self.client
            .table("audit_results")
            .select("*")
            .eq("audit_session_id", audit_session_id)
            .limit(1)
        )

        response = self._execute_with_retry(query)

        if not response.data:
            return None

        return response.data[0]

