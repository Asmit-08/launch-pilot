from supabase import Client

class UserRepository:
    def __init__(self, client: Client):
        self.client = client

    def get_user_by_auth_id(self, auth_user_id: str):
        response = self.client.table("users").select("*").eq("auth_user_id", auth_user_id).limit(1).execute()
        return response.data[0] if response.data else None

    def create_user(self, auth_user_id: str, email: str, name: str, avatar_url: str | None = None):
        response = self.client.table("users").insert({
            "auth_user_id": auth_user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
        }).execute()
        return response.data[0]

    def update_subscription(
        self,
        auth_user_id: str,
        subscription: str,
        subscription_end_at: str | None = None,
        dodo_subscription_id: str | None = None,
        cancel_at_period_end: bool = False,
        subscription_status: str | None = None,
    ):
        response = self.client.table("users").update({
            "subscription": subscription,
            "subscription_end_at": subscription_end_at,
            "dodo_subscription_id": dodo_subscription_id,
            "cancel_at_period_end": cancel_at_period_end,
            "subscription_status": subscription_status,
        }).eq("auth_user_id", auth_user_id).execute()
        return response.data[0] if response.data else None

    def get_user_by_email(self, email: str):
        response = self.client.table("users").select("*").eq("email", email).limit(1).execute()
        return response.data[0] if response.data else None