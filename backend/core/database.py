from typing import Dict, Any

# In-Memory & Persistent Data Store
# All seed jobs are owned by "usr_1" (Sarah Jenkins - recruiter)
DB: Dict[str, Any] = {
    "users": [
        {"id": "usr_1", "email": "recruiter@hireflow.ai", "password": "password123", "name": "Sarah Jenkins", "role": "recruiter", "company": "XYZ"},
        {"id": "usr_2", "email": "candidate@hireflow.ai", "password": "password123", "name": "Alex Rivera", "role": "candidate", "dob": "2000-05-14", "experience_years": 8.5, "skills": ["Go", "Rust", "Kafka", "Kubernetes", "PostgreSQL", "Distributed Systems"]}
    ],
    "jobs": [
        {
            "id": "job_101",
            "title": "Senior Distributed Systems Engineer",
            "department": "Infrastructure & Core Platform",
            "location": "Remote / San Francisco, CA",
            "company": "XYZ",
            "type": "Full-time",
            "experience_years": 5.0,
            "skills": ["Go", "Rust", "Kafka", "PostgreSQL", "Distributed Systems", "Kubernetes"],
            "applicant_count": 2,
            "status": "Active",
            "created_at": "2026-03-01",
            "created_by": "usr_1",  # Scoped to recruiter usr_1
            "requirements": [
                {"title": "5+ years in high-concurrency distributed systems", "weight": 35},
                {"title": "Experience with Go, Rust, or Python asyncio", "weight": 25},
                {"title": "Kafka or event-driven stream architectures", "weight": 20},
                {"title": "PostgreSQL optimization and query tuning", "weight": 20}
            ]
        },
        {
            "id": "job_102",
            "title": "Lead Full-Stack AI Engineer",
            "department": "Product Engineering",
            "location": "New York, NY / Hybrid",
            "type": "Full-time",
            "experience_years": 4.0,
            "skills": ["TypeScript", "React", "Next.js", "Tailwind", "Python", "FastAPI", "Vector DB"],
            "applicant_count": 1,
            "status": "Active",
            "created_at": "2026-03-05",
            "created_by": "usr_1",
            "requirements": [
                {"title": "TypeScript, React, Next.js, and Tailwind", "weight": 30},
                {"title": "LLM integrations (OpenAI, LangChain, Anthropic)", "weight": 35},
                {"title": "FastAPI or Node microservices", "weight": 20},
                {"title": "Vector databases (Pinecone, pgvector)", "weight": 15}
            ]
        },
        {
            "id": "job_103",
            "title": "Backend Platform Engineer",
            "department": "Core Banking",
            "location": "New York, NY (Remote)",
            "type": "Full-time",
            "experience_years": 3.0,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kafka"],
            "applicant_count": 0,
            "status": "Active",
            "created_at": "2026-03-10",
            "created_by": "usr_1",
            "requirements": [
                {"title": "Python, FastAPI, and robust microservices", "weight": 30},
                {"title": "Relational databases (PostgreSQL/MySQL) & Redis caching", "weight": 30},
                {"title": "Docker containerization and CI/CD pipelines", "weight": 20},
                {"title": "Experience with event streaming (Kafka/RabbitMQ)", "weight": 20}
            ]
        },
        {
            "id": "job_104",
            "title": "AI Infrastructure & ML Platform Engineer",
            "department": "AI Research",
            "location": "Austin, TX / Remote",
            "type": "Full-time",
            "experience_years": 5.0,
            "skills": ["PyTorch", "Kubernetes", "vLLM", "Python", "C++", "Docker"],
            "applicant_count": 0,
            "status": "Active",
            "created_at": "2026-03-12",
            "created_by": "usr_1",
            "requirements": [
                {"title": "PyTorch, deep learning inference, and model deployment", "weight": 35},
                {"title": "Kubernetes GPU cluster orchestration", "weight": 30},
                {"title": "High performance inference servers (vLLM, Triton)", "weight": 20},
                {"title": "Python and C++ systems optimization", "weight": 15}
            ]
        }
    ],
    "candidates": [
        {
            "id": "cand_1",
            "name": "Alex Rivera",
            "email": "alex.rivera@example.com",
            "dob": "2000-05-14",
            "role_target": "Senior Distributed Systems Engineer",
            "job_id": "job_101",
            "fit_score": 94,
            "experience_years": 8.5,
            "skills": ["Go", "Rust", "Kafka", "Kubernetes", "PostgreSQL", "Distributed Systems"],
            "status": "Shortlisted",
            "audit_trail_ready": True,
            "citations_count": 14,
            "education": "Bachelor's in Computer Science",
            "flagged_gaps": ["Multi-region AWS failover & active-active DR"],
            "rubric": [
                {"requirement": "5+ years in high-concurrency distributed systems", "score": 96, "status": "Verified", "weight": 35, "citation": "Led and executed the distributed stateful stream migration from Redis to Kafka."},
                {"requirement": "Experience with Go, Rust, or Python asyncio", "score": 92, "status": "Verified", "weight": 25, "citation": "Built streaming ingestion handling 25,000 requests/sec in Go."},
                {"requirement": "Kafka or event-driven stream architectures", "score": 95, "status": "Verified", "weight": 20, "citation": "Engineered event-driven microservices architecture using Apache Kafka."},
                {"requirement": "Multi-region AWS failover & active-active DR", "score": 65, "status": "Flagged Gap", "weight": 20, "citation": "Experience concentrated primarily in single-region AWS setups with asynchronous snapshots."}
            ]
        },
        {
            "id": "cand_2",
            "name": "Maya Lin",
            "email": "maya.lin@example.com",
            "dob": "1999-08-22",
            "role_target": "Senior Distributed Systems Engineer",
            "job_id": "job_101",
            "fit_score": 88,
            "experience_years": 6.0,
            "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "AWS", "Redis"],
            "status": "Interview Scheduled",
            "audit_trail_ready": True,
            "citations_count": 10,
            "education": "Master's Degree in Software Engineering",
            "flagged_gaps": ["Deep Go/Rust stream pipelines"],
            "rubric": [
                {"requirement": "5+ years in high-concurrency distributed systems", "score": 88, "status": "Verified", "weight": 35, "citation": "Designed async job queues using Celery, Redis, and FastAPI for real-time document workflows."},
                {"requirement": "Experience with Go, Rust, or Python asyncio", "score": 85, "status": "Verified", "weight": 25, "citation": "Strong Python asyncio production services with custom threadpool executors."},
                {"requirement": "Kafka or event-driven stream architectures", "score": 60, "status": "Flagged Gap", "weight": 20, "citation": "Familiar with pub/sub concepts; hands-on depth primarily in RabbitMQ and SQS."},
                {"requirement": "PostgreSQL optimization and query tuning", "score": 90, "status": "Verified", "weight": 20, "citation": "Optimized partitioned indices and connection pools under high read replica load."}
            ]
        },
        {
            "id": "cand_3",
            "name": "David Chen",
            "email": "david.chen@example.com",
            "dob": "1998-11-03",
            "role_target": "Lead Full-Stack AI Engineer",
            "job_id": "job_102",
            "fit_score": 97,
            "experience_years": 7.0,
            "skills": ["TypeScript", "React", "Next.js", "Python", "LangChain", "Vector DB", "PostgreSQL", "Docker"],
            "status": "Review Pending",
            "audit_trail_ready": True,
            "citations_count": 16,
            "education": "B.S. in Computer Science",
            "flagged_gaps": [],
            "rubric": [
                {"requirement": "TypeScript, React, Next.js, and Tailwind", "score": 98, "status": "Verified", "weight": 30, "citation": "Created design system library and architected 4 Next.js applications in production."},
                {"requirement": "LLM integrations (OpenAI, LangChain, Anthropic)", "score": 97, "status": "Verified", "weight": 35, "citation": "Built agentic RAG search copilots utilizing vector search and multi-model fallbacks."},
                {"requirement": "FastAPI or Node microservices", "score": 95, "status": "Verified", "weight": 20, "citation": "Built low-latency streaming endpoints with FastAPI and Server-Sent Events."},
                {"requirement": "Vector databases (Pinecone, pgvector)", "score": 96, "status": "Verified", "weight": 15, "citation": "Managed 10M+ document vector indexes with hybrid keyword + dense embedding search."}
            ]
        }
    ],
    "applications": [
        {
            "id": "app_1",
            "candidate_id": "cand_1",
            "job_id": "job_101",
            "job_title": "Senior Distributed Systems Engineer",
            "company": "XYZ",
            "status": "Shortlisted",
            "stage": "Shortlisted by Recruiter",
            "submitted_at": "2026-03-15"
        },
        {
            "id": "app_2",
            "candidate_id": "cand_1",
            "job_id": "job_102",
            "job_title": "Lead Full-Stack AI Engineer",
            "company": "Innovate Inc",
            "status": "Under Review",
            "stage": "Recruiter Screen",
            "submitted_at": "2026-03-16"
        }
    ]
}
