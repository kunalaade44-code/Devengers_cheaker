import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Users, Upload, Search, Sparkles, CheckCircle2, ShieldAlert,
  FileText, MessageSquare, Download, Sun, Moon, LogOut,
  BrainCircuit, Mic2,
  StickyNote,
  Plus, X, Check, Send,
  RefreshCw, Star, Clock, Award, Calendar, Briefcase
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { api, type Job, type Candidate, type InterviewQuestion, type InterviewSummary } from "../../lib/api"

// Features and COLOR_MAP removed — Features tab has been removed from navbar

export default function RecruiterDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isLight = theme === "light"

  // Live Data States
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [activeSection, setActiveSection] = useState<"candidates" | "interviews" | "summarizer" | "reports">("candidates")

  // Interview Engine States
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [isGeneratingKit, setIsGeneratingKit] = useState(false)
  const [interviewNotes, setInterviewNotes] = useState("")
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  // File Upload State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New Job Creation Modal State
  const [showCreateJobModal, setShowCreateJobModal] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState(user?.company || "XYZ")
  const [newJobDept, setNewJobDept] = useState("Engineering")
  const [newJobLocation, setNewJobLocation] = useState("Remote")
  const [newJobType, setNewJobType] = useState("Full-time")
  const [newJobExp, setNewJobExp] = useState("3.0")
  const [newJobSkills, setNewJobSkills] = useState<string[]>(["Python", "FastAPI", "PostgreSQL", "Docker"])
  const [skillInput, setSkillInput] = useState("")
  const [newJobReqs, setNewJobReqs] = useState<string>("")
  const [isSubmittingJob, setIsSubmittingJob] = useState(false)

  // Sync user company
  useEffect(() => {
    if (user?.company) {
      setNewJobCompany(user.company)
    }
  }, [user?.company])

  // Candidate Acceptance Celebration Modal
  const [acceptedCelebrationCandidate, setAcceptedCelebrationCandidate] = useState<Candidate | null>(null)

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  // (Features dropdown removed)

  // Load initial data — scoped to recruiter's own jobs only
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Pass recruiter user ID so backend only returns this recruiter's jobs
        const loadedJobs = await api.getJobs(user?.id)
        setJobs(loadedJobs)
        if (loadedJobs.length > 0) {
          setSelectedJob(loadedJobs[0])
          const loadedCands = await api.getCandidates(loadedJobs[0].id)
          setCandidates(loadedCands)
          if (loadedCands.length > 0) {
            setSelectedCandidate(loadedCands[0])
          }
        }
      } catch (err) {
        console.error("Error loading initial data:", err)
      }
    }
    loadInitialData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // (Features dropdown removed — no outside-click handler needed)

  // Switch Job filter
  const handleJobSelect = async (job: Job) => {
    setSelectedJob(job)
    try {
      const cands = await api.getCandidates(job.id)
      setCandidates(cands)
      setSelectedCandidate(cands.length > 0 ? cands[0] : null)
      setInterviewQuestions([])
      setInterviewSummary(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Real Semantic Natural Language Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      if (selectedJob) {
        const cands = await api.getCandidates(selectedJob.id)
        setCandidates(cands)
      }
      return
    }

    try {
      setIsSearching(true)
      const results = await api.searchCandidates(searchQuery, selectedJob?.id)
      setCandidates(results)
      if (results.length > 0) {
        setSelectedCandidate(results[0])
      }
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  // Real Bulk Resume Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedJob) return

    try {
      setIsUploading(true)
      setUploadMessage("Parsing document text, extracting competencies & calculating rubric...")
      const fileList = Array.from(files)
      const newCandidates = await api.uploadResumes(selectedJob.id, fileList)

      setCandidates(prev => [...newCandidates, ...prev])
      if (newCandidates.length > 0) {
        setSelectedCandidate(newCandidates[0])
      }
      setUploadMessage(`Successfully parsed & scored ${newCandidates.length} resume(s) with full audit citations!`)
      setTimeout(() => setUploadMessage(null), 5000)
    } catch (err) {
      console.error("Upload failed:", err)
      setUploadMessage("Error parsing uploaded files. Please check file format.")
      setTimeout(() => setUploadMessage(null), 4000)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Real Candidate Status Update & Manual Acceptance
  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const updated = await api.updateCandidateStatus(candidateId, newStatus)
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: updated.status } : c))
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, status: updated.status } : null)
      }
      
      if (newStatus === "Shortlisted") {
        showToast(`⭐ Candidate ${selectedCandidate?.name || "Applicant"} successfully shortlisted! You can now manually accept them.`)
      } else if (newStatus === "Accepted") {
        const candObj = candidates.find(c => c.id === candidateId) || selectedCandidate
        if (candObj) {
          setAcceptedCelebrationCandidate(candObj)
        }
        showToast(`🎉 Candidate ${selectedCandidate?.name || "Applicant"} manually ACCEPTED & offer extended!`)
      } else if (newStatus === "Interview Scheduled") {
        showToast(`📅 Interview round scheduled for ${selectedCandidate?.name || "Applicant"}.`)
      } else if (newStatus === "Rejected") {
        showToast(`Application closed for ${selectedCandidate?.name || "Applicant"}.`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Add/Remove skill from job creation form
  const handleAddJobSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = skillInput.trim()
    if (trimmed && !newJobSkills.includes(trimmed)) {
      setNewJobSkills([...newJobSkills, trimmed])
      setSkillInput("")
    }
  }

  const handleRemoveJobSkill = (skillToRemove: string) => {
    setNewJobSkills(newJobSkills.filter(s => s !== skillToRemove))
  }

  // Real Interview Kit Generator
  const handleGenerateInterviewKit = async (cand: Candidate) => {
    try {
      setIsGeneratingKit(true)
      const kit = await api.generateInterviewKit({
        candidate_name: cand.name,
        role_title: cand.role_target,
        flagged_gaps: cand.flagged_gaps,
        skills: cand.skills
      })
      setInterviewQuestions(kit)
      setActiveSection("interviews")
    } catch (err) {
      console.error(err)
    } finally {
      setIsGeneratingKit(false)
    }
  }

  // Real Interview Notes Summarization
  const handleSummarizeNotes = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!interviewNotes.trim()) return

    try {
      setIsSummarizing(true)
      const summary = await api.summarizeInterviewNotes({
        notes: interviewNotes,
        candidate_id: selectedCandidate?.id,
        candidate_name: selectedCandidate?.name,
        role_title: selectedCandidate?.role_target
      })
      setInterviewSummary(summary)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSummarizing(false)
    }
  }

  // Create New Job Handler with Skills and Experience
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle.trim()) return

    const expNum = parseFloat(newJobExp) || 3.0
    const skillsList = newJobSkills.length > 0 ? newJobSkills : ["Software Engineering", "Problem Solving"]

    const parsedReqs = newJobReqs.split("\n").filter(r => r.trim()).map((req, idx) => ({
      title: req.trim(),
      weight: idx === 0 ? 35 : idx === 1 ? 25 : 20
    }))

    const defaultReqs = parsedReqs.length > 0 ? parsedReqs : [
      { title: `${expNum}+ years engineering depth in ${newJobTitle}`, weight: 35 },
      ...skillsList.slice(0, 3).map(skill => ({
        title: `Production hands-on competency in ${skill}`,
        weight: 20
      }))
    ]

    try {
      setIsSubmittingJob(true)
      const jobCompany = newJobCompany.trim() || user?.company || "XYZ"

      // Pass recruiter_id so the job is tagged with this recruiter's ownership
      const created = await api.createJob({
        title: newJobTitle,
        company: jobCompany,
        department: newJobDept,
        location: newJobLocation,
        type: newJobType,
        experience_years: expNum,
        skills: skillsList,
        requirements: defaultReqs
      }, user?.id)
      setJobs(prev => [created, ...prev])
      setSelectedJob(created)
      setCandidates([])
      setSelectedCandidate(null)
      setShowCreateJobModal(false)
      setNewJobTitle("")
      setNewJobReqs("")
      showToast(`🎉 New Job Role "${created.title}" successfully posted! Ready to receive candidate applications.`)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmittingJob(false)
    }
  }

  // Export Full Evaluation Report
  const handleExportReport = async (cand: Candidate) => {
    try {
      const report = await api.getCandidateReport(cand.id)
      const reportText = `
================================================================================
HIREFLOW CANDIDATE AUDIT & SCREENING REPORT
================================================================================
Report ID: ${report.report_id}
Generated: ${report.generated_at}
Status: ${report.audit_verification.verdict}

[CANDIDATE INFORMATION]
Name: ${report.candidate.name}
Email: ${report.candidate.email}
Experience: ${report.candidate.experience}
Education: ${report.candidate.education}
Current Stage: ${report.candidate.status}

[ROLE EVALUATION]
Target Requisition: ${report.evaluation.target_role}
Fit Rubric Score: ${report.evaluation.fit_score}
Verified Citations: ${report.evaluation.citations_found}

[RUBRIC CRITERIA BREAKDOWN]
${report.evaluation.rubric_breakdown.map((r: any, idx: number) => `
${idx + 1}. Criteria: ${r.requirement} [Score: ${r.score}% - ${r.status}]
   Evidence: ${r.citation}
`).join("")}

[IDENTIFIED GAPS FOR INTERVIEW PROBING]
${report.evaluation.flagged_gaps.length > 0 ? report.evaluation.flagged_gaps.map((g: string) => `- ${g}`).join("\n") : "None (All rubric requirements verified)"}

--------------------------------------------------------------------------------
Checksum: ${report.audit_verification.integrity_checksum}
Engine: ${report.audit_verification.verified_by}
================================================================================
`
      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `HireFlow_Report_${cand.name.replace(/\s+/g, "_")}.txt`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  /* ── theme tokens ──────────────────────────────────────────────── */
  const page     = isLight ? "bg-[#f0f2f5]"                   : "bg-[#0c0c10]"
  const hdr      = isLight ? "bg-white border-slate-200"      : "bg-[#121217]/90 border-white/10"
  const card     = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#15151c] border-white/5"
  const cardSel  = isLight ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500"
                           : "bg-[#1a1a24] border-indigo-500 shadow-md ring-1 ring-indigo-500"
  const cardHov  = isLight ? "bg-white border-slate-200 hover:border-slate-300 hover:shadow"
                           : "bg-[#15151c] border-white/5 hover:border-white/15"
  const txt      = isLight ? "text-slate-900"                 : "text-slate-100"
  const txtSub   = isLight ? "text-slate-500"                 : "text-slate-400"
  const txtMed   = isLight ? "text-slate-700"                 : "text-slate-300"
  const inner    = isLight ? "bg-slate-50 border-slate-200"   : "bg-slate-900/60 border-white/5"
  const input    = isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                           : "bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
  const tag      = isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-300 border-white/5"
  const btnGhost = isLight ? "border-slate-200 text-slate-700 hover:bg-slate-100" : "border-white/10 text-slate-300 hover:bg-slate-800"
  const themeBtn = isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-slate-300 hover:bg-slate-800"
  const divider  = isLight ? "border-slate-200"               : "border-white/10"

  return (
    <div className={`min-h-screen ${page} ${txt} flex flex-col font-sans transition-colors duration-200`}>

      {/* ═══════════════════════════ NAVBAR ═══════════════════════════ */}
      <header className={`sticky top-0 z-50 ${hdr} backdrop-blur-md border-b px-6 py-3 flex items-center justify-between gap-4 flex-wrap`}>
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2 mr-2">
            HireFlow
            <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-400/30 px-2 py-0.5 rounded-full uppercase">
              Recruiter Hub
            </span>
          </Link>

          {/* Features tab removed — recruiters go directly to their workspace */}

          {/* Active Job Selection Dropdown */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/10">
            <span className={`text-[11px] font-semibold ${txtSub} hidden sm:inline`}>Job Requisition:</span>
            <select
              value={selectedJob?.id || ""}
              onChange={(e) => {
                const j = jobs.find(job => job.id === e.target.value)
                if (j) handleJobSelect(j)
              }}
              className={`text-xs font-bold py-1.5 px-3 rounded-xl border outline-none cursor-pointer max-w-[220px] truncate transition-colors ${input}`}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.applicant_count} applicants)
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Post New Job Requisition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${themeBtn} transition-colors`} title="Toggle theme">
            {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <div className={`flex items-center gap-2 pl-2 border-l ${divider}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "R"}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className={`font-semibold ${isLight ? "text-slate-800" : "text-white"} leading-tight`}>
                {user?.name || "Sarah Jenkins"}
              </p>
              <p className={`${txtSub} text-[10px]`}>{user?.company || "XYZ"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════ MAIN ════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${card}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${txtSub}`}>Active Candidates</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-3xl font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>{candidates.length}</p>
            <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Live synced with backend</span>
          </div>

          <div className={`p-5 rounded-2xl border ${card}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${txtSub}`}>Avg. Match Score</span>
              <Sparkles className="w-4 h-4 text-teal-500" />
            </div>
            <p className={`text-3xl font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
              {candidates.length > 0 ? Math.round(candidates.reduce((a, b) => a + b.fit_score, 0) / candidates.length) : 0}%
            </p>
            <span className={`text-[11px] ${txtSub} mt-1 block`}>{selectedJob?.title || "Active Requisition"}</span>
          </div>

          <div className={`p-5 rounded-2xl border ${card}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${txtSub}`}>Audit Trail Citations</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-3xl font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
              {candidates.reduce((a, b) => a + (b.citations_count || 10), 0)}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">100% Traceable Evidence</span>
          </div>

          {/* Real Bulk Resume Upload Tile */}
          <div className={`p-5 rounded-2xl border ${card} flex flex-col justify-between`}>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-widest ${txtSub} mb-1`}>Bulk Resume Screening</p>
              <p className={`text-xs ${txtSub} leading-relaxed`}>Upload PDF/DOCX resumes for live rubric scoring</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Parsing Resumes...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload Resumes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Status Toast */}
        {uploadMessage && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-teal-600" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 bg-indigo-600 text-white rounded-xl text-xs flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selected Job Overview Header Strip */}
        {selectedJob && (
          <div className={`p-4 rounded-2xl border ${card} flex items-center justify-between flex-wrap gap-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{selectedJob.title}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-400/20">
                    {selectedJob.department || "Engineering"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {selectedJob.location || "Remote"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] mt-1 text-slate-500 flex-wrap">
                  <span>Req. Experience: <strong className="text-indigo-600 font-semibold">{selectedJob.experience_years || 3}+ Years</strong></span>
                  <span>•</span>
                  <span>Required Skills: <strong className="text-slate-700 dark:text-slate-300">{(selectedJob.skills || ["Engineering", "System Design"]).slice(0, 4).join(", ")}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Post New Job Role
              </button>
            </div>
          </div>
        )}

        {/* Search Bar & Workspace Navigation Tabs */}
        <div className={`rounded-2xl border ${card} p-4 space-y-3`}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${txtSub}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Ask in natural language: "Find candidates with 6+ years experience in Kafka and PostgreSQL" or "Show shortlisted"`}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-indigo-500 transition-all ${input}`}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSearching ? "Searching..." : "Semantic Search"}
            </button>
          </form>

          {/* Quick Sub-Tabs */}
          <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-white/5 flex-wrap">
            {[
              { id: "candidates", label: "Candidate Intelligence & Shortlisting", icon: BrainCircuit },
              { id: "interviews", label: "AI Interview Kit", icon: Mic2 },
              { id: "summarizer", label: "Interview Notes Summarizer", icon: StickyNote },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeSection === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : `${txtSub} hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 1: Candidate Intelligence & Dossier ────────── */}
        {activeSection === "candidates" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Candidates List Column */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isLight ? "text-slate-800" : "text-slate-400"}`}>
                  Applied Candidates ({candidates.length})
                </h3>
                <span className={`text-[11px] ${txtSub}`}>Role: {selectedJob?.title}</span>
              </div>

              {candidates.length === 0 ? (
                <div className={`p-8 rounded-2xl border ${card} text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No applicants have applied to this role yet.</p>
                    <p className={`text-[11px] ${txtSub} mt-1`}>
                      When candidates submit an application from the Candidate Portal, their profile, verified skills, and match score will appear here automatically.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                    >
                      Or Upload Resumes Directly
                    </button>
                  </div>
                </div>
              ) : (
                candidates.map((cand) => {
                  const isShortlisted = cand.status === "Shortlisted"
                  const isAccepted = cand.status === "Accepted"
                  const isInterview = cand.status === "Interview Scheduled"

                  return (
                    <div
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidate(cand)
                        setInterviewQuestions([])
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedCandidate?.id === cand.id ? cardSel : cardHov
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-sm">
                            {cand.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{cand.name}</h4>
                            <p className={`text-[11px] ${txtSub}`}>{cand.experience_years} Years Exp • {cand.education || "STEM Degree"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-teal-600">{cand.fit_score}%</span>
                          <p className={`text-[10px] uppercase font-semibold ${txtSub}`}>Rubric Match</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <p className={`text-xs font-medium ${txtMed}`}>{cand.role_target}</p>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/30"
                            : isShortlisted
                            ? "bg-amber-500/10 text-amber-600 border-amber-400/30"
                            : isInterview
                            ? "bg-teal-500/10 text-teal-600 border-teal-400/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-400/20"
                        }`}>
                          {isAccepted && <Award className="w-3 h-3" />}
                          {isShortlisted && <Star className="w-3 h-3" />}
                          {isInterview && <Calendar className="w-3 h-3" />}
                          {!isAccepted && !isShortlisted && !isInterview && <Clock className="w-3 h-3" />}
                          <span>{cand.status}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {cand.skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${tag}`}>{s}</span>
                        ))}
                        {cand.skills.length > 4 && (
                          <span className={`text-[10px] ${txtSub} px-1 py-0.5`}>+{cand.skills.length - 4} more</span>
                        )}
                      </div>

                      {cand.flagged_gaps && cand.flagged_gaps.length > 0 && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 ${isLight ? "bg-amber-50" : "bg-amber-950/30"} border border-amber-300/40 p-1.5 rounded-lg mt-2`}>
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                          <span className="truncate">Flagged Gap: {cand.flagged_gaps[0]}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Candidate Dossier & Live Rubric Inspector */}
            {selectedCandidate ? (
              <div className={`lg:col-span-7 rounded-2xl border ${card} p-6 flex flex-col justify-between space-y-6`}>
                <div>
                  <div className={`flex items-start justify-between pb-5 border-b ${divider} mb-5 flex-wrap gap-4`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`text-xl font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedCandidate.name}</h3>
                        <span className={`text-xs px-3 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                          selectedCandidate.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/30"
                            : selectedCandidate.status === "Shortlisted"
                            ? "bg-amber-500/10 text-amber-600 border-amber-400/30"
                            : selectedCandidate.status === "Interview Scheduled"
                            ? "bg-teal-500/10 text-teal-600 border-teal-400/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-400/20"
                        }`}>
                          {selectedCandidate.status === "Accepted" && <Award className="w-3 h-3" />}
                          {selectedCandidate.status === "Shortlisted" && <Star className="w-3 h-3" />}
                          {selectedCandidate.status === "Interview Scheduled" && <Calendar className="w-3 h-3" />}
                          <span>{selectedCandidate.status}</span>
                        </span>
                      </div>
                      <p className={`text-xs ${txtSub}`}>
                        {selectedCandidate.email} • {selectedCandidate.experience_years} Yrs Exp • {selectedCandidate.education || "Verified Profile"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleGenerateInterviewKit(selectedCandidate)}
                        disabled={isGeneratingKit}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border ${
                          isLight ? "border-slate-300 text-slate-700 hover:bg-slate-50 bg-white" : "border-white/10 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        {isGeneratingKit ? "Synthesizing..." : "Interview Kit"}
                      </button>

                      {/* Status Dropdown */}
                      <select
                        value={selectedCandidate.status}
                        onChange={(e) => handleStatusChange(selectedCandidate.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer transition-colors ${input}`}
                      >
                        <option value="Applied">Applied / In Review</option>
                        <option value="Shortlisted">⭐ Shortlisted</option>
                        <option value="Interview Scheduled">📅 Interview Scheduled</option>
                        <option value="Accepted">🎉 Accepted / Hired</option>
                        <option value="Rejected">❌ Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Accepted Celebration Banner */}
                  {selectedCandidate.status === "Accepted" && (
                    <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                            🎉 Candidate Manually Accepted & Offer Extended!
                          </h4>
                          <p className="text-xs text-emerald-600/90 dark:text-emerald-400">
                            {selectedCandidate.name} has been approved for {selectedCandidate.role_target}. Live sync updated in candidate portal.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExportReport(selectedCandidate)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Offer Dossier
                      </button>
                    </div>
                  )}

                  {/* Rubric Breakdown with Traceable Citations */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${txtSub}`}>
                        Rubric Alignment & Traceable Citations
                      </h4>
                      <span className="text-[11px] font-bold text-indigo-600">
                        {selectedCandidate.citations_count || 12} Citations Indexed
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedCandidate.rubric && selectedCandidate.rubric.map((item, idx) => (
                        <div key={idx} className={`p-3.5 rounded-xl border ${inner}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-xs font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                              {item.requirement}
                            </span>
                            <span className={`text-sm font-extrabold ${item.status === "Verified" ? "text-teal-600" : "text-amber-500"}`}>
                              {item.score}%
                            </span>
                          </div>
                          <p className={`text-[11px] ${txtSub} flex items-start gap-1.5`}>
                            {item.status === "Verified" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            )}
                            <span>
                              <strong className={isLight ? "text-slate-700" : "text-slate-300"}>Evidence Citation:</strong> {item.citation}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dossier Workflow Toolbar: Shortlist & Manual Accept Buttons */}
                <div className={`pt-4 border-t ${divider} flex items-center justify-between text-xs flex-wrap gap-3`}>
                  <span className={txtSub}>
                    Audit Integrity: <strong className="text-teal-600 font-bold">100% Traceable Evidence</strong>
                  </span>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleExportReport(selectedCandidate)}
                      className={`px-3 py-2 rounded-xl border ${btnGhost} transition-colors flex items-center gap-1 text-xs`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Report (.txt)
                    </button>

                    {/* Shortlist Action Button (if not already shortlisted or accepted) */}
                    {selectedCandidate.status !== "Shortlisted" && selectedCandidate.status !== "Accepted" && (
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, "Shortlisted")}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all flex items-center gap-1.5 text-xs shadow-sm hover:shadow"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Shortlist Candidate
                      </button>
                    )}

                    {/* Manual Accept Button (Primary action when candidate is shortlisted) */}
                    {selectedCandidate.status === "Shortlisted" && (
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, "Accepted")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all flex items-center gap-1.5 text-xs shadow-md shadow-emerald-600/20 hover:scale-105"
                      >
                        <Award className="w-4 h-4" />
                        Manually Accept Candidate 🎉
                      </button>
                    )}

                    {/* Schedule Interview button */}
                    {selectedCandidate.status !== "Accepted" && selectedCandidate.status !== "Interview Scheduled" && (
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, "Interview Scheduled")}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center gap-1 text-xs shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Interview
                      </button>
                    )}

                    {/* Reject button */}
                    {selectedCandidate.status !== "Rejected" && (
                      <button
                        onClick={() => handleStatusChange(selectedCandidate.id, "Rejected")}
                        className="px-3 py-2 rounded-xl border border-red-300 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`lg:col-span-7 rounded-2xl border ${card} p-12 text-center text-xs ${txtSub}`}>
                Select a candidate from the left list to view their full rubric breakdown and audit evidence.
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 2: AI Interview Kit ────────────────────────── */}
        {activeSection === "interviews" && (
          <div className="space-y-5">
            <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">AI Interview Kit Engine</h3>
                <p className="text-xs opacity-90">
                  Targeted interview questions synthesized from candidate's verified skills & rubric gaps for {selectedCandidate?.name || "Candidate"}.
                </p>
              </div>
              <button
                onClick={() => selectedCandidate && handleGenerateInterviewKit(selectedCandidate)}
                disabled={isGeneratingKit}
                className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingKit ? "Synthesizing..." : "Regenerate Questions"}
              </button>
            </div>

            {interviewQuestions.length === 0 ? (
              <div className={`p-10 rounded-2xl border ${card} text-center space-y-3`}>
                <p className="text-sm font-semibold">Click "Generate Questions" to synthesize custom questions for {selectedCandidate?.name}.</p>
                <button
                  onClick={() => selectedCandidate && handleGenerateInterviewKit(selectedCandidate)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                >
                  Generate Interview Kit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewQuestions.map((q, idx) => (
                  <div key={idx} className={`rounded-2xl border ${card} p-5 flex flex-col justify-between space-y-3`}>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                        {q.category}
                      </span>
                      <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"} mt-2 mb-2`}>
                        "{q.question}"
                      </h4>
                    </div>
                    <div className={`p-3 rounded-xl border ${inner} text-xs`}>
                      <p className={`font-bold text-[10px] uppercase ${txtSub} mb-0.5`}>What to evaluate:</p>
                      <p className={txtMed}>{q.what_to_look_for}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 3: Interview Notes Summarizer ───────────────── */}
        {activeSection === "summarizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Input Notes Form */}
            <div className={`lg:col-span-6 rounded-2xl border ${card} p-6 space-y-4`}>
              <div>
                <h3 className="text-base font-bold text-indigo-600">Interview Notes Summarizer</h3>
                <p className={`text-xs ${txtSub}`}>
                  Paste your raw interview notes for {selectedCandidate?.name}. AI will map evidence, extract strengths, identify gaps, and calculate recommendation score.
                </p>
              </div>

              <form onSubmit={handleSummarizeNotes} className="space-y-4">
                <textarea
                  rows={8}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder={`Candidate demonstrated strong understanding of distributed cache invalidation and Kafka partitions. Discussed 2PC vs Saga patterns clearly. However, was slightly hesitant on multi-region AWS DR strategies...`}
                  className={`w-full text-xs p-3.5 rounded-xl border outline-none leading-relaxed transition-colors ${input}`}
                  required
                />

                <button
                  type="submit"
                  disabled={isSummarizing}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSummarizing ? "Synthesizing Evaluation..." : "Summarize & Map Evidence to Rubric"}
                </button>
              </form>
            </div>

            {/* Output Summary Card */}
            <div className={`lg:col-span-6 rounded-2xl border ${card} p-6 space-y-4`}>
              <h3 className="text-base font-bold text-teal-600">Structured Rubric Evaluation</h3>

              {interviewSummary ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${inner} flex items-center justify-between`}>
                    <div>
                      <p className={`text-[10px] font-bold uppercase ${txtSub}`}>Hiring Recommendation</p>
                      <h4 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                        {interviewSummary.recommendation}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-teal-600">{interviewSummary.confidence_score}%</span>
                      <p className={`text-[9px] uppercase font-bold ${txtSub}`}>Confidence</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h5 className={`text-xs font-bold ${txtMed} mb-2 flex items-center gap-1.5`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                      Key Verified Strengths
                    </h5>
                    <div className="space-y-1.5">
                      {interviewSummary.strengths.map((s, i) => (
                        <div key={i} className={`p-2.5 rounded-lg border text-xs ${isLight ? "bg-teal-50/50 border-teal-200/50 text-teal-900" : "bg-teal-950/20 border-teal-500/20 text-teal-300"}`}>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unanswered Areas */}
                  <div>
                    <h5 className={`text-xs font-bold ${txtMed} mb-2 flex items-center gap-1.5`}>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      Unanswered / Follow-up Areas
                    </h5>
                    <div className="space-y-1.5">
                      {interviewSummary.unanswered_areas.map((u, i) => (
                        <div key={i} className={`p-2.5 rounded-lg border text-xs ${isLight ? "bg-amber-50/50 border-amber-200/50 text-amber-900" : "bg-amber-950/20 border-amber-500/20 text-amber-300"}`}>
                          {u}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-8 rounded-xl border ${inner} text-center text-xs ${txtSub}`}>
                  Enter interview notes on the left and click "Summarize" to generate the structured evaluation output.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── CREATE JOB MODAL ─────────────────────────────────────── */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-2xl border ${
            isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#16161e] border-white/10 shadow-2xl shadow-black/60"
          } p-6 space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className={`font-extrabold text-base ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Post New Job Role
                </h3>
                <p className={`text-xs ${txtSub}`}>Define the role, required skills, and experience for applicant screening</p>
              </div>
              <button onClick={() => setShowCreateJobModal(false)} className={`p-1 rounded-lg ${txtSub} hover:text-slate-900 dark:hover:text-white`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              {/* Role Title */}
              <div>
                <label className={`block font-bold mb-1.5 ${txtMed}`}>
                  Job Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer or Full Stack AI Developer"
                  className={`w-full p-2.5 rounded-xl border outline-none font-medium ${input}`}
                  required
                />
              </div>

              {/* Experience Required & Employment Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1.5 ${txtMed} flex items-center gap-1`}>
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Required Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(e.target.value)}
                    placeholder="e.g. 3.5"
                    className={`w-full p-2.5 rounded-xl border outline-none font-medium ${input}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1.5 ${txtMed}`}>Employment Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-medium ${input}`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract / Freelance</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Required Skills Builder */}
              <div>
                <label className={`block font-bold mb-1.5 ${txtMed}`}>
                  Skills You Want Candidates To Have
                </label>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddJobSkill()
                      }
                    }}
                    placeholder="Type skill & press Enter (e.g. Go, AWS, Docker)"
                    className={`flex-1 p-2.5 rounded-xl border outline-none ${input}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddJobSkill()}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Skills Pills */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-dashed border-slate-200 dark:border-white/10 min-h-[38px] mb-2">
                  {newJobSkills.map((s) => (
                    <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-400/30 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" />
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveJobSkill(s)}
                        className="hover:text-red-500 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Suggested Skills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase ${txtSub}`}>Quick Add:</span>
                  {["React", "Python", "FastAPI", "Go", "Docker", "PostgreSQL", "AWS", "Kafka", "Kubernetes", "TypeScript"].map((s) => (
                    !newJobSkills.includes(s) && (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewJobSkills([...newJobSkills, s])}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${tag} hover:border-indigo-400 transition-colors`}
                      >
                        +{s}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Company & Department Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1.5 ${txtMed}`}>Hiring Company</label>
                  <input
                    type="text"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    placeholder="e.g. Acme Corp, Google, or XYZ"
                    className={`w-full p-2.5 rounded-xl border outline-none ${input}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1.5 ${txtMed}`}>Department</label>
                  <input
                    type="text"
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    placeholder="e.g. Infrastructure, Product"
                    className={`w-full p-2.5 rounded-xl border outline-none ${input}`}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={`block font-bold mb-1.5 ${txtMed}`}>Location</label>
                <input
                  type="text"
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  placeholder="e.g. Remote / San Francisco, CA"
                  className={`w-full p-2.5 rounded-xl border outline-none ${input}`}
                />
              </div>

              {/* Custom Requirements / Rubric Notes (Optional) */}
              <div>
                <label className={`block font-bold mb-1.5 ${txtMed}`}>
                  Specific Rubric Requirements (Optional - Auto-generated from skills if blank)
                </label>
                <textarea
                  rows={2}
                  value={newJobReqs}
                  onChange={(e) => setNewJobReqs(e.target.value)}
                  placeholder="Leave empty to auto-generate rubric criteria from required skills & experience"
                  className={`w-full p-2.5 rounded-xl border outline-none ${input}`}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className={`px-4 py-2 rounded-xl border ${btnGhost}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow flex items-center gap-1.5 transition-colors"
                >
                  {isSubmittingJob ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Posting Role...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Post Job Role & Activate Rubric
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ACCEPTANCE CELEBRATION MODAL ─────────────────────────── */}
      {acceptedCelebrationCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border ${
            isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#16161e] border-white/10 shadow-2xl shadow-black/60"
          } p-6 space-y-4 text-center animate-fade-in`}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/30">
                Candidate Officially Accepted 🎉
              </span>
              <h3 className={`font-black text-xl ${isLight ? "text-slate-900" : "text-white"} mt-2`}>
                {acceptedCelebrationCandidate.name}
              </h3>
              <p className={`text-xs ${txtSub} mt-1`}>
                Accepted for <strong className="text-indigo-600">{acceptedCelebrationCandidate.role_target}</strong> with an AI Rubric score of <strong className="text-teal-600">{acceptedCelebrationCandidate.fit_score}%</strong>.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${inner} text-left space-y-2 text-xs`}>
              <div className="flex justify-between items-center">
                <span className={txtSub}>Status Pipeline:</span>
                <span className="font-bold text-emerald-600">Accepted / Offer Ready</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={txtSub}>Verified Experience:</span>
                <span className="font-bold">{acceptedCelebrationCandidate.experience_years} Years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={txtSub}>Audit Evidence:</span>
                <span className="font-bold text-indigo-600">{acceptedCelebrationCandidate.citations_count || 12} Traceable Citations</span>
              </div>
            </div>

            <p className={`text-[11px] ${txtSub} italic`}>
              The candidate's dashboard pipeline has been updated in real-time to "Accepted / Offer Extended 🎉".
            </p>

            <div className="pt-2 flex justify-center gap-2.5">
              <button
                onClick={() => handleExportReport(acceptedCelebrationCandidate)}
                className={`px-4 py-2 rounded-xl border ${btnGhost} text-xs font-semibold flex items-center gap-1.5`}
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit Report
              </button>
              <button
                onClick={() => setAcceptedCelebrationCandidate(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
