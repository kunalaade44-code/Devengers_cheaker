from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from backend.core.database import DB
from backend.schemas.candidates import CandidateProfileUpdate, UpdateCandidateStatus, JobApplyRequest
from backend.services.ai_engine import ai_engine

router = APIRouter(tags=["Candidates"])

@router.get("/api/candidates")
def get_candidates(job_id: Optional[str] = None):
    if job_id:
        cands = [c for c in DB["candidates"] if c.get("job_id") == job_id]
        return {"success": True, "candidates": cands}
    return {"success": True, "candidates": DB["candidates"]}

@router.get("/api/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: str):
    cand = next((c for c in DB["candidates"] if c["id"] == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"success": True, "candidate": cand}

@router.patch("/api/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: str, req: UpdateCandidateStatus):
    cand = next((c for c in DB["candidates"] if c["id"] == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    old_status = cand.get("status")
    cand["status"] = req.status

    # Stage label mapping
    STAGE_MAP = {
        "Shortlisted":          "Shortlisted by Recruiter ⭐",
        "Accepted":             "Accepted / Offer Extended 🎉",
        "Interview Scheduled":  "Interview Round Scheduled 📅",
        "Rejected":             "Application Closed ❌",
        "Applied":              "Application Submitted / Under Review",
    }
    new_stage = STAGE_MAP.get(req.status, req.status)

    # Cascade to ALL applications that link to this candidate entry
    # via any of the 4 possible ID linkage patterns
    updated_apps = 0
    for app_item in DB["applications"]:
        is_linked = (
            # Direct candidate entry link (upload path)
            app_item.get("candidate_entry_id") == candidate_id
            # Via candidate_user_id + same job (apply path)
            or (
                cand.get("candidate_user_id")
                and app_item.get("candidate_id") == cand["candidate_user_id"]
                and app_item.get("job_id") == cand.get("job_id")
            )
            # Candidate id == application candidate_id + same job (seed data path)
            or (
                app_item.get("candidate_id") == cand["id"]
                and app_item.get("job_id") == cand.get("job_id")
            )
            # Candidate id == application candidate_id regardless of job (fallback)
            or app_item.get("candidate_id") == cand["id"]
        )
        if is_linked:
            app_item["status"] = req.status
            app_item["stage"] = new_stage
            updated_apps += 1

    return {
        "success": True,
        "candidate": cand,
        "applications_updated": updated_apps,
        "previous_status": old_status,
    }

@router.post("/api/recruiter/upload-resumes")
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

@router.post("/api/candidate/profile")
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
            "company": job.get("company", "XYZ"),
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

@router.post("/api/candidate/apply")
def apply_to_job(req: JobApplyRequest):
    job = next((j for j in DB["jobs"] if j["id"] == req.job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Find candidate profile or fallback to defaults
    cand_user = next((u for u in DB["users"] if u["id"] == req.candidate_id), None) or {}
    candidate_name = req.name or cand_user.get("name") or "Alex Rivera"
    candidate_email = req.email or cand_user.get("email") or "candidate@hireflow.ai"
    candidate_skills = req.skills if req.skills and len(req.skills) > 0 else cand_user.get("skills", ["Python", "FastAPI", "React", "PostgreSQL", "Docker"])
    candidate_exp = req.experience_years if req.experience_years is not None else cand_user.get("experience_years", 4.5)
    candidate_dob = req.dob or cand_user.get("dob", "2000-05-14")

    # Score rubric using AI Engine
    rubric_eval = ai_engine.score_candidate_rubric(
        candidate_skills=candidate_skills,
        candidate_exp=candidate_exp,
        requirements=job.get("requirements", []),
        candidate_text=f"Skills: {', '.join(candidate_skills)}. Experience: {candidate_exp} years."
    )

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

    # Create candidate entry linked to this job
    new_cand_id = f"cand_{len(DB['candidates']) + 1}"
    new_candidate = {
        "id": new_cand_id,
        "candidate_user_id": req.candidate_id,
        "name": candidate_name,
        "email": candidate_email,
        "dob": candidate_dob,
        "role_target": job["title"],
        "job_id": job["id"],
        "fit_score": rubric_eval["fit_score"],
        "experience_years": candidate_exp,
        "skills": candidate_skills,
        "status": "Applied",
        "audit_trail_ready": True,
        "citations_count": max(len(candidate_skills) + 3, 10),
        "education": "Bachelor's in Computer Science & Engineering",
        "flagged_gaps": rubric_eval["flagged_gaps"],
        "rubric": rubric_list
    }
    DB["candidates"].insert(0, new_candidate)

    app_record = {
        "id": f"app_{len(DB['applications']) + 1}",
        "candidate_id": req.candidate_id,
        "candidate_entry_id": new_cand_id,
        "job_id": req.job_id,
        "job_title": job["title"],
        "company": job.get("company", "XYZ"),
        "status": "Applied",
        "stage": "Application Submitted / Under Review",
        "submitted_at": datetime.now().strftime("%Y-%m-%d"),
        "fit_score": rubric_eval["fit_score"]
    }
    DB["applications"].insert(0, app_record)
    job["applicant_count"] += 1

    return {"success": True, "application": app_record, "candidate": new_candidate}

@router.get("/api/candidate/applications/{candidate_id}")
def get_candidate_applications(candidate_id: str):
    apps = [a for a in DB["applications"] if a["candidate_id"] == candidate_id]
    return {"success": True, "applications": apps}
