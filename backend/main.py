from fastapi import FastAPI
from backend.routers.audit import router as audit_router

app = FastAPI(
    title= "Launch Pilot Api",
    description= "AI Co-founder for SAAS Startups.",
    version= "1.0.0"
)

app.include_router(audit_router)

@app.get("/")
def home():
    return{
        "message" : "Welcome to Launch Pilot API"
    }