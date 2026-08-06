from repositories.repository_manager import user_repository

class AuthService:
    def __init__(self):
        self.user_repository = user_repository

    def sync_user(self, user_data: dict):
        existing_user = self.user_repository.get_user_by_auth_id(
            user_data["auth_user_id"]
        )
        if existing_user:
            return existing_user

        return self.user_repository.create_user(
            auth_user_id=user_data["auth_user_id"],
            email=user_data["email"],
            name=user_data["name"],
            avatar_url=user_data.get("avatar_url"),
        )