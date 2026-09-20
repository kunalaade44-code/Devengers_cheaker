from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query
from backend.core.database import DB
from backend.schemas.jobs import CreateJobRequest

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("")
def get_jobs(recruiter_id: Optional[str] = Query(default=None)):
    """
    Return all jobs, optionally scoped to the requesting recruiter.
    Pass ?recruiter_id=<usr_id> to get only that recruiter's postings.
    Candidate portal calls without recruiter_id to see all active jobs.
    """
    if recruiter_id:
        jobs = [j for j in DB["jobs"] if j.get("created_by") == recruiter_id]
    else:
        jobs = DB["jobs"]
    return {"success": True, "jobs": jobs}


@router.post("")
def create_job(req: CreateJobRequest, recruiter_id: Optional[str] = Query(default=None)):
    skills_list = req.skills if req.skills and len(req.skills) > 0 else ["Software Engineering", "System Design"]
    exp_years = req.experience_years if req.experience_years is not None else 3.0

    # Resolve company name from request, or recruiter profile, or default to XYZ
    recruiter_user = next((u for u in DB["users"] if u.get("id") == recruiter_id), None) if recruiter_id else None
    company_name = (
        (req.company and req.company.strip())
        or (recruiter_user.get("company") if recruiter_user else None)
        or "XYZ"
    )

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
        "company": company_name,
        "type": req.type or "Full-time",
        "experience_years": exp_years,
        "skills": skills_list,
        "applicant_count": 0,
        "status": "Active",
        "created_at": datetime.now().strftime("%Y-%m-%d"),
        "created_by": recruiter_id or "unknown",  # Scoped ownership
        "requirements": requirements
    }
    DB["jobs"].insert(0, new_job)
    return {"success": True, "job": new_job}
