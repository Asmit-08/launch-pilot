from repositories.repository_manager import user_repository

class AuthService:
    def __init__(self):
        self.user_repository = user_repository

    def sync_user(self, user_data: dict):
        print("AUTH SYNC: checking existing user")

        existing_user = self.user_repository.get_user_by_auth_id(
            user_data["auth_user_id"]
        )

        print("AUTH SYNC: existing =", bool(existing_user))

        if existing_user:
            print("AUTH SYNC: returning existing user")
            return existing_user

        print("AUTH SYNC: creating new user")

        user = self.user_repository.create_user(
            auth_user_id=user_data["auth_user_id"],
            email=user_data["email"],
            name=user_data["name"],
            avatar_url=user_data.get("avatar_url"),
        )

        print("AUTH SYNC: new user created")

        return user