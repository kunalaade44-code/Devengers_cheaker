from typing import Optional
from pydantic import BaseModel, EmailStr

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
