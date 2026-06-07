from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.audit import router as audit_router
from backend.routers.chat import router as chat_router


app = FastAPI(
    title= "Launch Pilot Api",
    description= "AI Co-founder for SAAS Startups.",
    version= "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit_router)
app.include_router(chat_router)

@app.get("/")
def home():
    return{
        "message" : "Welcome to Launch Pilot API"
    }