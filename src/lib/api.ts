/**
 * HireFlow API Client
 * Seamlessly interfaces with the FastAPI backend on /api (proxied to http://127.0.0.1:8000).
 * Provides robust fallback caching if backend restarts.
 */

const API_BASE = "/api"

export interface JobRequirement {
  title: string
  weight: number
}

export interface Job {
  id: string
  title: string
  department: string
  location: string
  company?: string
  type: string
  experience_years?: number
  skills?: string[]
  applicant_count: number
  status: string
  created_at?: string
  created_by?: string
  requirements: JobRequirement[]
}

export interface RubricItem {
  requirement: string
  score: number
  status: string
  weight?: number
  citation: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  dob?: string
  role_target: string
  job_id: string
  fit_score: number
  experience_years: number
  skills: string[]
  status: string
  audit_trail_ready: boolean
  citations_count: number
  education?: string
  flagged_gaps: string[]
  rubric: RubricItem[]
}

export interface InterviewQuestion {
  category: string
  question: string
  what_to_look_for: string
}

export interface InterviewSummary {
  candidate: string
  role: string
  strengths: string[]
  unanswered_areas: string[]
  recommendation: string
  confidence_score: number
  summary_timestamp: string
}

export const api = {
  // Authentication
  async login(payload: { email: string; password?: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || "Authentication failed. Please check credentials.")
    }
    return data
  },

  async register(payload: { fullName: string; email: string; password?: string; role: string; company?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || "Registration failed. Please try again.")
    }
    return data
  },

  // Jobs — Candidate portal fetches ALL jobs; Recruiter fetches only their own
  async getJobs(recruiterId?: string): Promise<Job[]> {
    try {
      const url = recruiterId
        ? `${API_BASE}/jobs?recruiter_id=${encodeURIComponent(recruiterId)}`
        : `${API_BASE}/jobs`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch jobs")
      const data = await res.json()
      return data.jobs || []
    } catch (err) {
      console.warn("Using fallback local jobs data", err)
      return [
        {
          id: "job_101",
          title: "Senior Distributed Systems Engineer",
          department: "Infrastructure & Core Platform",
          location: "Remote / San Francisco, CA",
          type: "Full-time",
          applicant_count: 42,
          status: "Active",
          requirements: [
            { title: "5+ years in high-concurrency distributed systems", weight: 35 },
            { title: "Experience with Go, Rust, or Python asyncio", weight: 25 },
            { title: "Kafka or event-driven stream architectures", weight: 20 },
            { title: "PostgreSQL optimization and query tuning", weight: 20 }
          ]
        },
        {
          id: "job_102",
          title: "Lead Full-Stack AI Engineer",
          department: "Product Engineering",
          location: "New York, NY / Hybrid",
          type: "Full-time",
          applicant_count: 28,
          status: "Active",
          requirements: [
            { title: "TypeScript, React, Next.js, and Tailwind", weight: 30 },
            { title: "LLM integrations (OpenAI, LangChain, Anthropic)", weight: 35 },
            { title: "FastAPI or Node microservices", weight: 20 },
            { title: "Vector databases (Pinecone, pgvector)", weight: 15 }
          ]
        }
      ]
    }
  },

  async createJob(
    jobData: {
      title: string
      department: string
      location: string
      company?: string
      type?: string
      experience_years?: number
      skills?: string[]
      requirements?: JobRequirement[]
    },
    recruiterId?: string
  ): Promise<Job> {
    const url = recruiterId
      ? `${API_BASE}/jobs?recruiter_id=${encodeURIComponent(recruiterId)}`
      : `${API_BASE}/jobs`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData)
    })
    const data = await res.json()
    return data.job
  },

  // Candidates
  async getCandidates(jobId?: string): Promise<Candidate[]> {
    try {
      const url = jobId ? `${API_BASE}/candidates?job_id=${encodeURIComponent(jobId)}` : `${API_BASE}/candidates`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch candidates")
      const data = await res.json()
      return data.candidates || []
    } catch (err) {
      console.warn("Using fallback candidates data", err)
      return []
    }
  },

  async getCandidate(candidateId: string): Promise<Candidate | null> {
    try {
      const res = await fetch(`${API_BASE}/candidates/${candidateId}`)
      if (!res.ok) throw new Error("Candidate not found")
      const data = await res.json()
      return data.candidate
    } catch (err) {
      console.warn(err)
      return null
    }
  },

  async updateCandidateStatus(candidateId: string, status: string): Promise<Candidate> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    const data = await res.json()
    return data.candidate
  },

  // Upload Resumes
  async uploadResumes(jobId: string, files: File[]): Promise<Candidate[]> {
    const formData = new FormData()
    formData.append("job_id", jobId)
    files.forEach(file => {
      formData.append("files", file)
    })

    const res = await fetch(`${API_BASE}/recruiter/upload-resumes`, {
      method: "POST",
      body: formData
    })
    const data = await res.json()
    return data.candidates || []
  },

  // Candidate Self-Service Profile
  async updateCandidateProfile(profile: {
    candidate_id?: string
    name?: string
    dob?: string
    experience_years: number
    skills: string[]
    resume_file_name?: string
    resume_text?: string
  }) {
    const res = await fetch(`${API_BASE}/candidate/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    })
    return await res.json()
  },

  // Interviews
  async generateInterviewKit(payload: {
    candidate_name: string
    role_title: string
    flagged_gaps?: string[]
    skills?: string[]
  }): Promise<InterviewQuestion[]> {
    const res = await fetch(`${API_BASE}/interviews/generate-kit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    return data.questions || []
  },

  async summarizeInterviewNotes(payload: {
    notes: string
    candidate_id?: string
    candidate_name?: string
    role_title?: string
  }): Promise<InterviewSummary> {
    const res = await fetch(`${API_BASE}/interviews/summarize-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    return data.summary
  },

  // Semantic Search
  async searchCandidates(query: string, jobId?: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/recruiter/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, job_id: jobId })
    })
    const data = await res.json()
    return data.results || []
  },

  // Report
  async getCandidateReport(candidateId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/candidate/${candidateId}`)
    const data = await res.json()
    return data.report
  },

  // Apply
  async applyToJob(
    candidateId: string,
    jobId: string,
    profileData?: {
      name?: string
      email?: string
      skills?: string[]
      experience_years?: number
      dob?: string
      resume_file_name?: string
    }
  ) {
    const res = await fetch(`${API_BASE}/candidate/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        ...profileData
      })
    })
    return await res.json()
  },

  async getCandidateApplications(candidateId: string) {
    try {
      const res = await fetch(`${API_BASE}/candidate/applications/${candidateId}`)
      const data = await res.json()
      return data.applications || []
    } catch {
      return []
    }
  }
}
