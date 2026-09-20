from typing import Optional
from pydantic import BaseModel

class SearchQuery(BaseModel):
    query: str
    job_id: Optional[str] = None
