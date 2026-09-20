from fastapi import APIRouter
from backend.schemas.interviews import InterviewKitRequest, InterviewNotesRequest
from backend.services.ai_engine import ai_engine

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])

@router.post("/generate-kit")
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

@router.post("/summarize-notes")
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
