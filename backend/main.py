from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from routers.audit import router as audit_router
from routers.chat import router as chat_router
from routers.persona import router as persona_router
from routers.auth import router as auth_router
from routers.projects import router as project_router
from routers.landing_page_analysis import router as landing_page_router
from routers.billing import router as billing_router


app = FastAPI(
    title="Plavtora API",
    description="AI decision support for founders.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://launch-pilot-flax.vercel.app",
        "https://plavtora.com",
        "https://www.plavtora.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(audit_router)
app.include_router(chat_router)
app.include_router(persona_router)
app.include_router(project_router)
app.include_router(landing_page_router)
app.include_router(billing_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Plavtora API"
    }


@app.get("/healt")
def health_check():
    return {
        "status": "ok",
        "service": "plavtora-api",
    }


@app.head("/health")
def health_head():
    return Response(status_code=200)