from supabase import Client

class UserRepository:
    def __init__(self, client: Client):
        self.client = client

    def get_user_by_auth_id(self, auth_user_id: str):

        response = (self.client.table("users").select("*").eq("auth_user_id", auth_user_id).limit(1).execute())

        if not response.data:
            return None
        return response.data[0]

    def create_user(
    self,
    auth_user_id: str,
    email: str,
    name: str,
    avatar_url: str | None = None,
):
        response = (
            self.client
            .table("users")
            .insert({
                "auth_user_id": auth_user_id,
                "email": email,
                "name": name,
                "avatar_url": avatar_url,
            })
            .execute()
        )

        return response.data[0]