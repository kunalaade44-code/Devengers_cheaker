from typing import Optional, List
from pydantic import BaseModel

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

class JobApplyRequest(BaseModel):
    candidate_id: str
    job_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    dob: Optional[str] = None
    resume_file_name: Optional[str] = None
