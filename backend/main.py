import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from backend.services.ai_engine import ai_engine

app = FastAPI(
    title="HireFlow - Candidate Screening & Interview Intelligence API",
    description="FastAPI Backend for Resume Parsing, Rubric Matching, Interview Generation, and Semantic Talent Search",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory & Persistent Data Store
DB: Dict[str, Any] = {
    "users": [
        {"id": "usr_1", "email": "recruiter@hireflow.ai", "name": "Sarah Jenkins", "role": "recruiter", "company": "TechCorp Global"},
        {"id": "usr_2", "email": "candidate@hireflow.ai", "name": "Alex Rivera", "role": "candidate", "dob": "2000-05-14", "experience_years": 8.5, "skills": ["Go", "Rust", "Kafka", "Kubernetes", "PostgreSQL", "Distributed Systems"]}
    ],
    "jobs": [
        {
            "id": "job_101",
            "title": "Senior Distributed Systems Engineer",
            "department": "Infrastructure & Core Platform",
            "location": "Remote / San Francisco, CA",
            "type": "Full-time",
            "experience_years": 5.0,
            "skills": ["Go", "Rust", "Kafka", "PostgreSQL", "Distributed Systems", "Kubernetes"],
            "applicant_count": 2,
            "status": "Active",
            "created_at": "2026-03-01",
            "requirements": [
                {"title": "5+ years in high-concurrency distributed systems", "weight": 35},
                {"title": "Experience with Go, Rust, or Python asyncio", "weight": 25},
                {"title": "Kafka or event-driven stream architectures", "weight": 20},
                {"title": "PostgreSQL optimization and query tuning", "weight": 20}
            ]
        },
        {
            "id": "job_102",
            "title": "Lead Full-Stack AI Engineer",
            "department": "Product Engineering",
            "location": "New York, NY / Hybrid",
            "type": "Full-time",
            "experience_years": 4.0,
            "skills": ["TypeScript", "React", "Next.js", "Tailwind", "Python", "FastAPI", "Vector DB"],
            "applicant_count": 1,
            "status": "Active",
            "created_at": "2026-03-05",
            "requirements": [
                {"title": "TypeScript, React, Next.js, and Tailwind", "weight": 30},
                {"title": "LLM integrations (OpenAI, LangChain, Anthropic)", "weight": 35},
                {"title": "FastAPI or Node microservices", "weight": 20},
                {"title": "Vector databases (Pinecone, pgvector)", "weight": 15}
            ]
        },
        {
            "id": "job_103",
            "title": "Backend Platform Engineer",
            "department": "Core Banking",
            "location": "New York, NY (Remote)",
            "type": "Full-time",
            "experience_years": 3.0,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kafka"],
            "applicant_count": 0,
            "status": "Active",
            "created_at": "2026-03-10",
            "requirements": [
                {"title": "Python, FastAPI, and robust microservices", "weight": 30},
                {"title": "Relational databases (PostgreSQL/MySQL) & Redis caching", "weight": 30},
                {"title": "Docker containerization and CI/CD pipelines", "weight": 20},
                {"title": "Experience with event streaming (Kafka/RabbitMQ)", "weight": 20}
            ]
        },
        {
            "id": "job_104",
            "title": "AI Infrastructure & ML Platform Engineer",
            "department": "AI Research",
            "location": "Austin, TX / Remote",
            "type": "Full-time",
            "experience_years": 5.0,
            "skills": ["PyTorch", "Kubernetes", "vLLM", "Python", "C++", "Docker"],
            "applicant_count": 0,
            "status": "Active",
            "created_at": "2026-03-12",
            "requirements": [
                {"title": "PyTorch, deep learning inference, and model deployment", "weight": 35},
                {"title": "Kubernetes GPU cluster orchestration", "weight": 30},
                {"title": "High performance inference servers (vLLM, Triton)", "weight": 20},
                {"title": "Python and C++ systems optimization", "weight": 15}
            ]
        }
    ],
    "candidates": [
        {
            "id": "cand_1",
            "name": "Alex Rivera",
            "email": "alex.rivera@example.com",
            "dob": "2000-05-14",
            "role_target": "Senior Distributed Systems Engineer",
            "job_id": "job_101",
            "fit_score": 94,
            "experience_years": 8.5,
            "skills": ["Go", "Rust", "Kafka", "Kubernetes", "PostgreSQL", "Distributed Systems"],
            "status": "Shortlisted",
            "audit_trail_ready": True,
            "citations_count": 14,
            "education": "Bachelor's in Computer Science",
            "flagged_gaps": ["Multi-region AWS failover & active-active DR"],
            "rubric": [
                {"requirement": "5+ years in high-concurrency distributed systems", "score": 96, "status": "Verified", "weight": 35, "citation": "Led and executed the distributed stateful stream migration from Redis to Kafka."},
                {"requirement": "Experience with Go, Rust, or Python asyncio", "score": 92, "status": "Verified", "weight": 25, "citation": "Built streaming ingestion handling 25,000 requests/sec in Go."},
                {"requirement": "Kafka or event-driven stream architectures", "score": 95, "status": "Verified", "weight": 20, "citation": "Engineered event-driven microservices architecture using Apache Kafka."},
                {"requirement": "Multi-region AWS failover & active-active DR", "score": 65, "status": "Flagged Gap", "weight": 20, "citation": "Experience concentrated primarily in single-region AWS setups with asynchronous snapshots."}
            ]
        },
        {
            "id": "cand_2",
            "name": "Maya Lin",
            "email": "maya.lin@example.com",
            "dob": "1999-08-22",
            "role_target": "Senior Distributed Systems Engineer",
            "job_id": "job_101",
            "fit_score": 88,
            "experience_years": 6.0,
            "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "AWS", "Redis"],
            "status": "Interview Scheduled",
            "audit_trail_ready": True,
            "citations_count": 10,
            "education": "Master's Degree in Software Engineering",
            "flagged_gaps": ["Deep Go/Rust stream pipelines"],
            "rubric": [
                {"requirement": "5+ years in high-concurrency distributed systems", "score": 88, "status": "Verified", "weight": 35, "citation": "Designed async job queues using Celery, Redis, and FastAPI for real-time document workflows."},
                {"requirement": "Experience with Go, Rust, or Python asyncio", "score": 85, "status": "Verified", "weight": 25, "citation": "Strong Python asyncio production services with custom threadpool executors."},
                {"requirement": "Kafka or event-driven stream architectures", "score": 60, "status": "Flagged Gap", "weight": 20, "citation": "Familiar with pub/sub concepts; hands-on depth primarily in RabbitMQ and SQS."},
                {"requirement": "PostgreSQL optimization and query tuning", "score": 90, "status": "Verified", "weight": 20, "citation": "Optimized partitioned indices and connection pools under high read replica load."}
            ]
        },
        {
            "id": "cand_3",
            "name": "David Chen",
            "email": "david.chen@example.com",
            "dob": "1998-11-03",
            "role_target": "Lead Full-Stack AI Engineer",
            "job_id": "job_102",
            "fit_score": 97,
            "experience_years": 7.0,
            "skills": ["TypeScript", "React", "Next.js", "Python", "LangChain", "Vector DB", "PostgreSQL", "Docker"],
            "status": "Review Pending",
            "audit_trail_ready": True,
            "citations_count": 16,
            "education": "B.S. in Computer Science",
            "flagged_gaps": [],
            "rubric": [
                {"requirement": "TypeScript, React, Next.js, and Tailwind", "score": 98, "status": "Verified", "weight": 30, "citation": "Created design system library and architected 4 Next.js applications in production."},
                {"requirement": "LLM integrations (OpenAI, LangChain, Anthropic)", "score": 97, "status": "Verified", "weight": 35, "citation": "Built agentic RAG search copilots utilizing vector search and multi-model fallbacks."},
                {"requirement": "FastAPI or Node microservices", "score": 95, "status": "Verified", "weight": 20, "citation": "Built low-latency streaming endpoints with FastAPI and Server-Sent Events."},
                {"requirement": "Vector databases (Pinecone, pgvector)", "score": 96, "status": "Verified", "weight": 15, "citation": "Managed 10M+ document vector indexes with hybrid keyword + dense embedding search."}
            ]
        }
    ],
    "applications": [
        {
            "id": "app_1",
            "candidate_id": "cand_1",
            "job_id": "job_101",
            "job_title": "Senior Distributed Systems Engineer",
            "company": "TechCorp Global",
            "status": "Shortlisted",
            "stage": "Technical Deep-Dive Next",
            "submitted_at": "2026-03-15"
        },
        {
            "id": "app_2",
            "candidate_id": "cand_1",
            "job_id": "job_102",
            "job_title": "Lead Full-Stack AI Engineer",
            "company": "Innovate Inc",
            "status": "Under Review",
            "stage": "Recruiter Screen",
            "submitted_at": "2026-03-16"
        }
    ]
}

# Pydantic Request Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = "password123"
    role: Optional[str] = "recruiter"

class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: Optional[str] = "password123"
    role: str
    company: Optional[str] = None

class CreateJobRequest(BaseModel):
    title: str
    department: str
    location: str
    type: Optional[str] = "Full-time"
    experience_years: Optional[float] = 3.0
    skills: Optional[List[str]] = []
    requirements: Optional[List[Dict[str, Any]]] = None

class CandidateProfileUpdate(BaseModel):
    candidate_id: Optional[str] = "cand_1"
    name: Optional[str] = "Alex Rivera"
    dob: Optional[str] = "2000-05-14"
    experience_years: float = 8.5
    skills: List[str]
    resume_file_name: Optional[str] = "Alex_Rivera_Resume_2026.pdf"
    resume_text: Optional[str] = ""

class UpdateCandidateStatus(BaseModel):
    status: str

class SearchQuery(BaseModel):
    query: str
    job_id: Optional[str] = None

class InterviewKitRequest(BaseModel):
    candidate_name: str
    role_title: str
    flagged_gaps: Optional[List[str]] = []
    skills: Optional[List[str]] = []

class InterviewNotesRequest(BaseModel):
    notes: str
    candidate_id: Optional[str] = None
    candidate_name: Optional[str] = "Alex Rivera"
    role_title: Optional[str] = "Senior Distributed Systems Engineer"

class JobApplyRequest(BaseModel):
    candidate_id: str
    job_id: str

# ── Health & Root ───────────────────────────────────────────────
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "HireFlow AI Screening API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# ── Authentication ──────────────────────────────────────────────
@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = next((u for u in DB["users"] if u["email"].lower() == req.email.lower()), None)
    if not user:
        # Create session dynamically
        user = {
            "id": f"usr_{len(DB['users']) + 1}",
            "email": req.email,
            "name": req.email.split("@")[0].capitalize(),
            "role": req.role or "recruiter",
            "company": "TechCorp Global" if req.role == "recruiter" else None
        }
        DB["users"].append(user)

    return {
        "success": True,
        "token": f"jwt_hireflow_token_{user['id']}",
        "user": user
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    user = {
        "id": f"usr_{len(DB['users']) + 1}",
        "email": req.email,
        "name": req.fullName,
        "role": req.role,
        "company": req.company or ("TechCorp Global" if req.role == "recruiter" else None)
    }
    DB["users"].append(user)
    return {
        "success": True,
        "token": f"jwt_hireflow_token_{user['id']}",
        "user": user
    }

# ── Jobs API ───────────────────────────────────────────────────
@app.get("/api/jobs")
def get_jobs():
    return {"success": True, "jobs": DB["jobs"]}

@app.post("/api/jobs")
def create_job(req: CreateJobRequest):
    skills_list = req.skills if req.skills and len(req.skills) > 0 else ["Software Engineering", "System Design"]
    exp_years = req.experience_years if req.experience_years is not None else 3.0

    # Build rubric requirements if not explicitly provided
    if req.requirements and len(req.requirements) > 0:
        requirements = req.requirements
    else:
        requirements = [
            {"title": f"{exp_years}+ years demonstrated engineering experience in {req.title}", "weight": 35}
        ]
        for skill in skills_list[:3]:
            requirements.append({
                "title": f"Proficiency and production hands-on with {skill}",
                "weight": 20
            })
        if len(requirements) < 4:
            requirements.append({
                "title": "Clean architecture, testing, and modern cloud deployment",
                "weight": 25
            })

    new_job = {
        "id": f"job_{100 + len(DB['jobs']) + 1}",
        "title": req.title,
        "department": req.department,
        "location": req.location,
        "type": req.type or "Full-time",
        "experience_years": exp_years,
        "skills": skills_list,
        "applicant_count": 0,
        "status": "Active",
        "created_at": datetime.now().strftime("%Y-%m-%d"),
        "requirements": requirements
    }
    DB["jobs"].insert(0, new_job)
    return {"success": True, "job": new_job}

# ── Candidates API ──────────────────────────────────────────────
@app.get("/api/candidates")
def get_candidates(job_id: Optional[str] = None):
    if job_id:
        cands = [c for c in DB["candidates"] if c.get("job_id") == job_id]
        return {"success": True, "candidates": cands}
    return {"success": True, "candidates": DB["candidates"]}

@app.get("/api/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: str):
    cand = next((c for c in DB["candidates"] if c["id"] == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"success": True, "candidate": cand}

@app.patch("/api/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: str, req: UpdateCandidateStatus):
    cand = next((c for c in DB["candidates"] if c["id"] == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    cand["status"] = req.status

    # Synchronize across applications table
    for app_item in DB["applications"]:
        if (
            app_item.get("candidate_entry_id") == candidate_id
            or (app_item.get("candidate_id") == cand.get("candidate_user_id") and app_item.get("job_id") == cand.get("job_id"))
            or (app_item.get("candidate_id") == cand.get("id") and app_item.get("job_id") == cand.get("job_id"))
        ):
            app_item["status"] = req.status
            if req.status == "Shortlisted":
                app_item["stage"] = "Shortlisted by Recruiter"
            elif req.status == "Accepted":
                app_item["stage"] = "Accepted / Offer Extended 🎉"
            elif req.status == "Interview Scheduled":
                app_item["stage"] = "Interview Round Scheduled"
            elif req.status == "Rejected":
                app_item["stage"] = "Application Closed"
            else:
                app_item["stage"] = req.status

    return {"success": True, "candidate": cand}

# ── Bulk Resume Upload & Screening API ──────────────────────────
@app.post("/api/recruiter/upload-resumes")
async def upload_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    job = next((j for j in DB["jobs"] if j["id"] == job_id), None)
    requirements = job["requirements"] if job else [
        {"title": "Demonstrated full-stack or backend engineering experience", "weight": 50},
        {"title": "Proficiency in modern programming languages & frameworks", "weight": 50}
    ]

    processed_candidates = []

    for file in files:
        file_bytes = await file.read()
        extracted_text = ai_engine.extract_text_from_file_bytes(file_bytes, file.filename)
        entities = ai_engine.extract_resume_entities(extracted_text, default_name=file.filename.replace(".pdf", "").replace(".docx", "").replace("_", " ").title())
        rubric_eval = ai_engine.score_candidate_rubric(entities["skills"], entities["experience_years"], requirements, extracted_text)

        # Format Rubric entries for candidate object
        rubric_list = [
            {
                "requirement": b["requirement"],
                "score": b["score"],
                "status": b["status"],
                "weight": b["weight"],
                "citation": b["evidence_citation"]
            }
            for b in rubric_eval["rubric_breakdown"]
        ]

        new_candidate = {
            "id": f"cand_{len(DB['candidates']) + 1}",
            "name": entities["name"] if entities["name"] != "Candidate Profile" else file.filename.replace(".pdf", "").replace(".docx", "").replace("_", " ").title(),
            "email": entities["email"] or f"{file.filename.split('.')[0].lower()}@applicant.io",
            "role_target": job["title"] if job else "Software Engineer",
            "job_id": job_id,
            "fit_score": rubric_eval["fit_score"],
            "experience_years": entities["experience_years"],
            "skills": entities["skills"],
            "status": "Analyzed",
            "audit_trail_ready": True,
            "citations_count": entities["citations_found"],
            "education": entities["education"],
            "flagged_gaps": rubric_eval["flagged_gaps"],
            "rubric": rubric_list
        }

        DB["candidates"].append(new_candidate)
        processed_candidates.append(new_candidate)

    if job:
        job["applicant_count"] += len(processed_candidates)

    return {
        "success": True,
        "processed_count": len(processed_candidates),
        "candidates": processed_candidates
    }

# ── Candidate Self-Service Profile API ──────────────────────────
@app.post("/api/candidate/profile")
def update_candidate_profile(req: CandidateProfileUpdate):
    # Find candidate or create
    cand = next((c for c in DB["candidates"] if c["id"] == req.candidate_id), None)
    if not cand:
        cand = {
            "id": req.candidate_id or f"cand_{len(DB['candidates']) + 1}",
            "name": req.name or "Alex Rivera",
            "email": "alex.rivera@example.com",
            "status": "Active Profile",
            "audit_trail_ready": True,
            "citations_count": len(req.skills) + 4
        }
        DB["candidates"].append(cand)

    cand["dob"] = req.dob
    cand["experience_years"] = req.experience_years
    cand["skills"] = req.skills
    cand["name"] = req.name or cand["name"]

    # Recalculate match scores across all active jobs
    matched_jobs_summary = []
    for job in DB["jobs"]:
        rubric_eval = ai_engine.score_candidate_rubric(
            candidate_skills=req.skills,
            candidate_exp=req.experience_years,
            requirements=job["requirements"],
            candidate_text=req.resume_text or ""
        )
        matched_jobs_summary.append({
            "job_id": job["id"],
            "job_title": job["title"],
            "company": "TechCorp Global",
            "location": job["location"],
            "match_score": rubric_eval["fit_score"],
            "verified_skills": [s for s in req.skills if any(s.lower() in r["title"].lower() for r in job["requirements"])],
            "flagged_gaps": rubric_eval["flagged_gaps"]
        })

    # Update primary rubric
    if matched_jobs_summary:
        cand["fit_score"] = matched_jobs_summary[0]["match_score"]
        cand["role_target"] = matched_jobs_summary[0]["job_title"]
        cand["job_id"] = matched_jobs_summary[0]["job_id"]

    return {
        "success": True,
        "candidate": cand,
        "matched_jobs": matched_jobs_summary
    }

# ── Interview Intelligence API ─────────────────────────────────
@app.post("/api/interviews/generate-kit")
def generate_interview_kit(req: InterviewKitRequest):
    kit = ai_engine.generate_interview_kit(
        candidate_name=req.candidate_name,
        role_title=req.role_title,
        flagged_gaps=req.flagged_gaps or [],
        skills=req.skills or []
    )
    return {
        "success": True,
        "candidate": req.candidate_name,
        "role": req.role_title,
        "questions": kit
    }

@app.post("/api/interviews/summarize-notes")
def summarize_interview_notes(req: InterviewNotesRequest):
    summary = ai_engine.summarize_interview_notes(
        notes=req.notes,
        candidate_name=req.candidate_name or "Candidate",
        role_title=req.role_title or "Software Engineer"
    )
    return {
        "success": True,
        "summary": summary
    }

# ── Semantic Natural Language Search API ────────────────────────
@app.post("/api/recruiter/search")
def search_candidates(req: SearchQuery):
    q = req.query.lower().strip()
    results = []

    for c in DB["candidates"]:
        relevance = 0
        reasons = []

        # 1. Exact or partial skill match
        matched_skills = [s for s in c["skills"] if s.lower() in q]
        if matched_skills:
            relevance += 40 + len(matched_skills) * 10
            reasons.append(f"Direct match on verified skills: {', '.join(matched_skills)}")

        # 2. Target role matching
        if any(term in c.get("role_target", "").lower() for term in q.split() if len(term) > 3):
            relevance += 30
            reasons.append("Target role requirement alignment")

        # 3. Seniority threshold queries (e.g. 'senior', 'lead', '>5 years', 'experience')
        if any(term in q for term in ["senior", "lead", "staff", "principal", "architect"]) and c["experience_years"] >= 6:
            relevance += 25
            reasons.append(f"Seniority requirement satisfied ({c['experience_years']} yrs experience)")
        elif "years" in q or "yrs" in q:
            relevance += 20
            reasons.append(f"Experience level verified: {c['experience_years']} yrs")

        # 4. Status or fit score queries (e.g. 'shortlisted', 'top candidate', '90%')
        if "shortlist" in q and c["status"].lower() == "shortlisted":
            relevance += 35
            reasons.append("Shortlisted candidate status")
        if "no gap" in q and len(c.get("flagged_gaps", [])) == 0:
            relevance += 30
            reasons.append("Zero flagged requirement gaps in rubric")

        # Fallback baseline relevance
        if relevance == 0:
            relevance = int(c.get("fit_score", 70) * 0.8)
            reasons.append("Rubric evaluation compatibility")

        results.append({
            **c,
            "relevance_score": min(99, relevance),
            "evidence_match_reason": "; ".join(reasons)
        })

    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return {
        "success": True,
        "query": req.query,
        "count": len(results),
        "results": results
    }

# ── Standardized Audit & Evaluation Report API ──────────────────
@app.get("/api/reports/candidate/{candidate_id}")
def generate_candidate_report(candidate_id: str):
    cand = next((c for c in DB["candidates"] if c["id"] == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = next((j for j in DB["jobs"] if j["id"] == cand.get("job_id")), None)

    report_payload = {
        "report_id": f"REP-2026-{cand['id'].upper()}",
        "generated_at": datetime.now().strftime("%B %d, %Y - %H:%M:%S UTC"),
        "candidate": {
            "name": cand["name"],
            "email": cand["email"],
            "experience": f"{cand['experience_years']} Years",
            "education": cand.get("education", "B.S. in Computer Science"),
            "status": cand["status"]
        },
        "evaluation": {
            "target_role": cand.get("role_target", "Software Engineer"),
            "fit_score": f"{cand['fit_score']}%",
            "citations_found": cand.get("citations_count", 12),
            "flagged_gaps": cand.get("flagged_gaps", []),
            "rubric_breakdown": cand.get("rubric", [])
        },
        "audit_verification": {
            "verdict": "VERIFIED FOR INTERVIEW LOOP" if cand["fit_score"] >= 80 else "ADDITIONAL EVALUATION REQUIRED",
            "integrity_checksum": "SHA256-HIREFLOW-AUDIT-VALIDATED",
            "verified_by": "HireFlow AI Screening Core v1.0"
        }
    }
    return {"success": True, "report": report_payload}

# ── Candidate Job Applications API ──────────────────────────────
@app.post("/api/candidate/apply")
def apply_to_job(req: JobApplyRequest):
    job = next((j for j in DB["jobs"] if j["id"] == req.job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app_record = {
        "id": f"app_{len(DB['applications']) + 1}",
        "candidate_id": req.candidate_id,
        "job_id": req.job_id,
        "job_title": job["title"],
        "company": "TechCorp Global",
        "status": "Application Submitted",
        "stage": "Recruiter Review",
        "submitted_at": datetime.now().strftime("%Y-%m-%d")
    }
    DB["applications"].insert(0, app_record)
    job["applicant_count"] += 1
    return {"success": True, "application": app_record}

@app.get("/api/candidate/applications/{candidate_id}")
def get_candidate_applications(candidate_id: str):
    apps = [a for a in DB["applications"] if a["candidate_id"] == candidate_id]
    return {"success": True, "applications": apps}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
