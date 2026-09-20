from typing import Optional, List
from pydantic import BaseModel

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
