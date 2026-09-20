from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CreateJobRequest(BaseModel):
    title: str
    department: str
    location: str
    company: Optional[str] = None
    type: Optional[str] = "Full-time"
    experience_years: Optional[float] = 3.0
    skills: Optional[List[str]] = []
    requirements: Optional[List[Dict[str, Any]]] = None
