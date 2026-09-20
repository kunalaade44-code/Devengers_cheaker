from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth, jobs, candidates, interviews, search, reports

app = FastAPI(
    title="HireFlow - Candidate Screening & Interview Intelligence API",
    description="FastAPI Backend for Resume Parsing, Rubric Matching, Interview Generation, and Semantic Talent Search",
    version="1.0.0"
)

# ── CORS Middleware ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ─────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(interviews.router)
app.include_router(search.router)
app.include_router(reports.router)

# ── Health Check ─────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "HireFlow AI Screening API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
