from fastapi import APIRouter
from backend.core.database import DB
from backend.schemas.search import SearchQuery

router = APIRouter(prefix="/api/recruiter", tags=["Search"])

@router.post("/search")
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

        # 3. Seniority threshold queries
        if any(term in q for term in ["senior", "lead", "staff", "principal", "architect"]) and c["experience_years"] >= 6:
            relevance += 25
            reasons.append(f"Seniority requirement satisfied ({c['experience_years']} yrs experience)")
        elif "years" in q or "yrs" in q:
            relevance += 20
            reasons.append(f"Experience level verified: {c['experience_years']} yrs")

        # 4. Status or fit score queries
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
