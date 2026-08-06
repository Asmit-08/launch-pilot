from core.auth import verify_access_token

print(verify_access_token("eyJhbGciOiJIUzI1NiJ9.invalid.signature"))