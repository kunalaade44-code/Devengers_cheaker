from fastapi import APIRouter, HTTPException, status
from backend.core.database import DB
from backend.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login")
def login(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = next((u for u in DB["users"] if u["email"].strip().lower() == email_clean), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found with this email. Please sign up first."
        )

    # Validate password
    stored_password = user.get("password")
    if stored_password and req.password and stored_password != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials."
        )

    # Validate portal role
    if req.role and user.get("role") and user.get("role").lower() != req.role.lower():
        role_label = user.get("role").capitalize()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account is registered as a {role_label}. Please switch to the {role_label} portal tab."
        )

    return {
        "success": True,
        "token": f"jwt_hireflow_token_{user['id']}",
        "user": user
    }

@router.post("/register")
def register(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    existing = next((u for u in DB["users"] if u["email"].strip().lower() == email_clean), None)
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    user = {
        "id": f"usr_{len(DB['users']) + 1}",
        "email": req.email.strip(),
        "password": req.password or "password123",
        "name": req.fullName.strip(),
        "role": req.role.strip().lower(),
        "company": req.company.strip() if req.company and req.company.strip() else ("XYZ" if req.role.lower() == "recruiter" else None)
    }
    
    if user["role"] == "candidate":
        user["experience_years"] = 3.0
        user["skills"] = ["Software Engineering", "Problem Solving"]
        user["dob"] = "2000-01-01"

    DB["users"].append(user)
    return {
        "success": True,
        "token": f"jwt_hireflow_token_{user['id']}",
        "user": user
    }
