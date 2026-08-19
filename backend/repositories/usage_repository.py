from supabase import Client


class UsageRepository:
    def __init__(self, client: Client):
        self.client = client

    def get_usage(self, user_id: str):
        response = (
            self.client
            .table("user_usage")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        return response.data[0] if response.data else None

    def create_usage(self, user_id: str):
        response = (
            self.client
            .table("user_usage")
            .insert({
                "user_id": user_id,
            })
            .execute()
        )

        return response.data[0] if response.data else None

    def update_usage(self, user_id: str, updates: dict):
        response = (
            self.client
            .table("user_usage")
            .update(updates)
            .eq("user_id", user_id)
            .execute()
        )

        return response.data[0] if response.data else None