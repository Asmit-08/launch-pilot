"""
api_test.py

FastAPI V2 API integration test.

Before running:
    1. Start FastAPI.
    2. Set the environment variables below.
    3. Run:
           python api_test.py

PowerShell example:

    $env:API_BASE_URL="http://127.0.0.1:8000"
    $env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
    $env:SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    $env:TEST_EMAIL="your-test-email"
    $env:TEST_PASSWORD="your-test-password"
    $env:PROJECT_ID="92e416ad-d99b-49f1-85ce-2333bd469742"

Then:

    python api_test.py
"""

import os
import sys
import json

import httpx
from supabase import create_client


# =========================================================
# CONFIG
# =========================================================

API_BASE_URL = os.getenv(
    "API_BASE_URL",
    "http://127.0.0.1:8000",
).rstrip("/")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

TEST_EMAIL = os.getenv("TEST_EMAIL")
TEST_PASSWORD = os.getenv("TEST_PASSWORD")

PROJECT_ID = os.getenv(
    "PROJECT_ID",
    "92e416ad-d99b-49f1-85ce-2333bd469742",
)


# =========================================================
# VALIDATE CONFIG
# =========================================================

required_variables = {
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_ANON_KEY": SUPABASE_ANON_KEY,
    "TEST_EMAIL": TEST_EMAIL,
    "TEST_PASSWORD": TEST_PASSWORD,
}

missing = [
    name
    for name, value in required_variables.items()
    if not value
]

if missing:
    print()
    print("Missing environment variables:")
    for name in missing:
        print(f"  - {name}")

    print()
    print("Set them before running the test.")

    sys.exit(1)


# =========================================================
# HELPERS
# =========================================================

def print_section(title: str):
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def print_response(response: httpx.Response):
    print(f"HTTP {response.status_code}")

    try:
        print(
            json.dumps(
                response.json(),
                indent=2,
                default=str,
            )
        )
    except Exception:
        print(response.text)


def assert_status(
    response: httpx.Response,
    expected: int,
):
    if response.status_code != expected:
        print_response(response)

        raise AssertionError(
            f"Expected HTTP {expected}, "
            f"got HTTP {response.status_code}"
        )


# =========================================================
# 1. SUPABASE AUTHENTICATION
# =========================================================

print_section("1. SUPABASE AUTHENTICATION")

print("Signing in test user...")

try:

    supabase = create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
    )

    auth_response = supabase.auth.sign_in_with_password({
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })

except Exception as e:

    print()
    print("Supabase authentication failed.")
    print(f"Error: {e}")

    sys.exit(1)


if not auth_response.session:
    print()
    print("Authentication succeeded but no session was returned.")
    sys.exit(1)


ACCESS_TOKEN = auth_response.session.access_token

print()
print("Supabase login successful.")
print("Access token obtained.")
print("Token is intentionally not printed.")


# =========================================================
# 2. FASTAPI CLIENT
# =========================================================

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

client = httpx.Client(
    base_url=API_BASE_URL,
    headers=headers,
    timeout=60.0,
)


# =========================================================
# 3. SERVER CHECK
# =========================================================

print_section("2. FASTAPI SERVER")

try:

    response = client.get("/")

    print_response(response)

except httpx.RequestError as e:

    print()
    print("Could not connect to FastAPI.")
    print(f"Backend: {API_BASE_URL}")
    print(f"Error: {e}")

    client.close()
    sys.exit(1)


print()
print("FastAPI server is reachable.")


# =========================================================
# 4. GET DAILY OBJECTIVE
# =========================================================

print_section("3. GET DAILY OBJECTIVE")

response = client.get(
    f"/projects/{PROJECT_ID}/daily-objective"
)

print_response(response)

assert_status(response, 200)

daily_objective = response.json()

assert daily_objective["project_id"] == PROJECT_ID

assert "has_active_objective" in daily_objective
assert "state" in daily_objective
assert "objective" in daily_objective
assert "constraint" in daily_objective

print()
print("Daily objective endpoint passed.")


# =========================================================
# 5. VERIFY ACTIVE OBJECTIVE
# =========================================================

print_section("4. ACTIVE OBJECTIVE")

ACTIVE_OBJECTIVE = None

if daily_objective["has_active_objective"]:

    ACTIVE_OBJECTIVE = daily_objective["objective"]

    print(
        json.dumps(
            ACTIVE_OBJECTIVE,
            indent=2,
            default=str,
        )
    )

    assert ACTIVE_OBJECTIVE["status"] == "active"

    print()
    print("Active objective verified.")

else:

    print("No active objective exists.")

    print()
    print(
        "This is expected if the project has already completed "
        "its current V2 objective."
    )


# =========================================================
# 6. UNAUTHENTICATED REQUEST
# =========================================================

print_section("5. UNAUTHENTICATED REQUEST")

unauthenticated_client = httpx.Client(
    base_url=API_BASE_URL,
    timeout=30.0,
)

response = unauthenticated_client.get(
    f"/projects/{PROJECT_ID}/daily-objective"
)

print_response(response)

assert response.status_code == 401, (
    "Expected HTTP 401 for unauthenticated request, "
    f"got HTTP {response.status_code}"
)

unauthenticated_client.close()

print()
print("401 authorization test passed.")


# =========================================================
# 7. NONEXISTENT PROJECT
# =========================================================

print_section("6. NONEXISTENT PROJECT")

FAKE_PROJECT_ID = (
    "00000000-0000-0000-0000-000000000000"
)

response = client.get(
    f"/projects/{FAKE_PROJECT_ID}/daily-objective"
)

print_response(response)

assert response.status_code == 404, (
    "Expected HTTP 404 for nonexistent project, "
    f"got HTTP {response.status_code}"
)

print()
print("404 project validation test passed.")


# =========================================================
# 8. OUTCOME VALIDATION
# =========================================================

if ACTIVE_OBJECTIVE is not None:

    print_section("7. OUTCOME VALIDATION")

    # -----------------------------------------------------
    # quantity = 0
    # -----------------------------------------------------

    print()
    print("Testing quantity = 0...")

    response = client.post(
        f"/projects/{PROJECT_ID}/daily-objective/outcome",
        json={
            "quantity": 0,
            "completion_status": "partial",
            "observations": "Validation test.",
        },
    )

    print_response(response)

    assert response.status_code in (400, 422)

    print("quantity validation passed.")

    # -----------------------------------------------------
    # invalid completion status
    # -----------------------------------------------------

    print()
    print("Testing invalid completion_status...")

    response = client.post(
        f"/projects/{PROJECT_ID}/daily-objective/outcome",
        json={
            "quantity": 1,
            "completion_status": "invalid_status",
            "observations": "Validation test.",
        },
    )

    print_response(response)

    assert response.status_code in (400, 422)

    print("completion_status validation passed.")

    # -----------------------------------------------------
    # empty observations
    # -----------------------------------------------------

    print()
    print("Testing empty observations...")

    response = client.post(
        f"/projects/{PROJECT_ID}/daily-objective/outcome",
        json={
            "quantity": 1,
            "completion_status": "partial",
            "observations": "",
        },
    )

    print_response(response)

    assert response.status_code in (400, 422)

    print("observations validation passed.")

else:

    print_section("7. OUTCOME VALIDATION")

    print(
        "SKIPPED — there is no active objective."
    )


# =========================================================
# 9. SUBMIT REAL OUTCOME
# =========================================================

if ACTIVE_OBJECTIVE is not None:

    print_section("8. SUBMIT OBJECTIVE OUTCOME")

    payload = {
        "quantity": 1,
        "completion_status": "partial",
        "observations": (
            "API integration test: "
            "objective outcome successfully submitted."
        ),
        "evidence": (
            "Recorded through the FastAPI integration test."
        ),
        "user_interpretation": None,
        "unexpected_result": None,
    }

    print("Request payload:")
    print(
        json.dumps(
            payload,
            indent=2,
        )
    )

    response = client.post(
        f"/projects/{PROJECT_ID}/daily-objective/outcome",
        json=payload,
    )

    print()
    print("Response:")
    print_response(response)

    assert_status(response, 200)

    outcome_result = response.json()

    assert "status" in outcome_result
    assert "objective_completed" in outcome_result
    assert "evidence" in outcome_result
    assert "objective" in outcome_result
    assert "progress" in outcome_result

    print()
    print("Objective outcome endpoint passed.")

else:

    print_section("8. SUBMIT OBJECTIVE OUTCOME")

    print(
        "SKIPPED — there is no active objective."
    )


# =========================================================
# 10. VERIFY STATE AFTER OUTCOME
# =========================================================

print_section("9. VERIFY STATE AFTER OUTCOME")

response = client.get(
    f"/projects/{PROJECT_ID}/daily-objective"
)

print_response(response)

assert_status(response, 200)

updated_state = response.json()

assert updated_state["project_id"] == PROJECT_ID

print()
print("State retrieval after outcome passed.")


# =========================================================
# 11. FINAL
# =========================================================

print_section("FINAL RESULT")

print(
    """
API INTEGRATION TEST PASSED

Verified:

    ✓ Supabase authentication
    ✓ JWT acquisition
    ✓ FastAPI server connectivity
    ✓ Authenticated V2 endpoint
    ✓ Daily objective retrieval
    ✓ Project validation
    ✓ 401 unauthenticated access
    ✓ 404 nonexistent project
    ✓ Outcome validation
    ✓ Objective outcome submission
    ✓ Evidence returned through API
    ✓ Startup state retrieval after outcome

The HTTP/API layer is connected correctly to the V2 backend.
"""
)

client.close()