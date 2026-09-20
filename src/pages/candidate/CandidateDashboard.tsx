import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Sparkles, CheckCircle2, ShieldAlert, BookOpen,
  Sun, Moon, LogOut, Upload, ArrowRight, Target, Award, Check,
  Search, Calendar, Briefcase, Plus, X, CheckCheck, MapPin, Building,
  RefreshCw
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { api, type Job } from "../../lib/api"

interface MatchedRoleItem {
  id: string
  title: string
  company: string
  location: string
  experience_years?: number
  skills?: string[]
  matchScore: number
  stage: string
  verifiedSkills: string[]
  missingSkills: string[]
  practiceQuestions: string[]
}

export default function CandidateDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isLight = theme === "light"

  // Active tab state in navbar
  const [activeTab, setActiveTab] = useState<"insights" | "prep" | "applications">("insights")

  // Profile Form States
  const [resumeFileName, setResumeFileName] = useState("Alex_Rivera_Resume_2026.pdf")
  const [dob, setDob] = useState("2000-05-14")
  const [experience, setExperience] = useState("8.5")
  const [skills, setSkills] = useState<string[]>([
    "Go", "Rust", "Kafka", "Kubernetes", "PostgreSQL", "Distributed Systems", "Python", "FastAPI"
  ])
  const [newSkill, setNewSkill] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Real Jobs & Applications state
  const [rawJobs, setRawJobs] = useState<Job[]>([])
  const [matchedRoles, setMatchedRoles] = useState<MatchedRoleItem[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch live jobs and applications on mount + poll every 10s for live recruiter status updates
  useEffect(() => {
    async function loadData() {
      try {
        const jobs = await api.getJobs()  // candidates see ALL jobs
        setRawJobs(jobs)
        recalculateJobMatches(jobs, skills, parseFloat(experience) || 4.0)

        const apps = await api.getCandidateApplications(user?.id || "cand_1")
        setApplications(apps)
      } catch (err) {
        console.error("Error loading candidate data:", err)
      }
    }

    loadData()
    // Poll every 10 seconds so status changes by recruiter appear live
    const interval = setInterval(loadData, 10_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manual refresh handler
  const handleRefreshApplications = async () => {
    try {
      const apps = await api.getCandidateApplications(user?.id || "cand_1")
      setApplications(apps)
    } catch (err) {
      console.error(err)
    }
  }

  // Recalculate match scores against real jobs
  const recalculateJobMatches = (jobsList: Job[], currentSkills: string[], _expYears?: number) => {
    const list: MatchedRoleItem[] = jobsList.map(job => {
      let matchedCount = 0
      const verified: string[] = []
      const missing: string[] = []

      const targetSkills = job.skills && job.skills.length > 0 ? job.skills : []
      const reqList = job.requirements || []

      // Skill matches
      currentSkills.forEach(s => {
        if (targetSkills.some(ts => ts.toLowerCase() === s.toLowerCase())) {
          matchedCount += 1
          verified.push(s)
        } else if (reqList.some(r => r.title.toLowerCase().includes(s.toLowerCase()))) {
          matchedCount += 1
          verified.push(s)
        }
      })

      targetSkills.forEach(ts => {
        if (!currentSkills.some(s => s.toLowerCase() === ts.toLowerCase())) {
          missing.push(ts)
        }
      })

      const uniqueVerified = Array.from(new Set(verified))
      const totalDenominator = targetSkills.length > 0 ? targetSkills.length : reqList.length || 1
      const pct = Math.min(98, Math.max(55, Math.round((matchedCount / totalDenominator) * 100)))

      return {
        id: job.id,
        title: job.title,
        company: job.company || "XYZ",
        location: job.location,
        experience_years: job.experience_years,
        skills: job.skills,
        matchScore: pct,
        stage: "Open for Application",
        verifiedSkills: uniqueVerified.length > 0 ? uniqueVerified : currentSkills.slice(0, 3),
        missingSkills: missing.length > 0 ? missing.slice(0, 3) : ["System Design Depth"],
        practiceQuestions: [
          `In your work with ${currentSkills[0] || "Backend Systems"}, how do you ensure high availability and low latency?`,
          `How do you approach testing and monitoring for ${job.title} requisitions in production?`
        ]
      }
    })

    setMatchedRoles(list)
  }

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed]
      setSkills(updated)
      setNewSkill("")
      recalculateJobMatches(rawJobs, updated, parseFloat(experience) || 4.0)
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove)
    setSkills(updated)
    recalculateJobMatches(rawJobs, updated, parseFloat(experience) || 4.0)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        setResumeFileName(file.name)
        setIsUploading(false)
      }, 700)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.updateCandidateProfile({
        candidate_id: user?.id || "cand_1",
        name: user?.name || "Alex Rivera",
        dob,
        experience_years: parseFloat(experience) || 4.0,
        skills,
        resume_file_name: resumeFileName
      })

      recalculateJobMatches(rawJobs, skills, parseFloat(experience) || 4.0)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickApply = async (job: MatchedRoleItem) => {
    try {
      const res = await api.applyToJob(user?.id || "cand_1", job.id, {
        name: user?.name || "Alex Rivera",
        email: user?.email || "candidate@hireflow.ai",
        skills,
        experience_years: parseFloat(experience) || 4.0,
        dob,
        resume_file_name: resumeFileName
      })
      setApplications(prev => [res.application, ...prev.filter(a => a.job_id !== job.id)])
      alert(`🎉 Application submitted for ${job.title}! The recruiter will review your profile, verified skills, and rubric score.`)
      setActiveTab("applications")
    } catch (err) {
      console.error(err)
    }
  }

  const filteredJobs = matchedRoles.filter(job => {
    const q = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      (job.skills && job.skills.some(s => s.toLowerCase().includes(q))) ||
      job.verifiedSkills.some(s => s.toLowerCase().includes(q)) ||
      job.missingSkills.some(s => s.toLowerCase().includes(q))
    )
  })

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  /* ─── theme-driven class tokens ─────────────────────────────────── */
  const page     = isLight ? "bg-[#f0f2f5]"                   : "bg-[#0c0c10]"
  const header   = isLight ? "bg-white border-slate-200"      : "bg-[#121217]/90 border-white/10"
  const card     = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#15151c] border-white/5"
  const txt      = isLight ? "text-slate-900"                 : "text-slate-100"
  const txtSub   = isLight ? "text-slate-500"                 : "text-slate-400"
  const txtMed   = isLight ? "text-slate-700"                 : "text-slate-300"
  const inner    = isLight ? "bg-slate-50 border-slate-200"   : "bg-slate-900/60 border-white/5"
  const tag      = isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-300 border-white/5"
  const inputBg  = isLight ? "bg-white border-slate-300 text-slate-900 focus:border-indigo-600" : "bg-[#101015] border-white/10 text-white focus:border-indigo-500"
  const themeBtn = isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-slate-300 hover:bg-slate-800"
  const divider  = isLight ? "border-slate-200"               : "border-white/10"

  return (
    <div className={`min-h-screen ${page} ${txt} flex flex-col font-sans transition-colors duration-200`}>

      {/* ── Navbar with 3 Navigation Tabs embedded ──────────────── */}
      <header className={`sticky top-0 z-40 ${header} backdrop-blur-md border-b px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap`}>
        {/* Brand & Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2 shrink-0">
            HireFlow
            <span className="text-[11px] font-semibold bg-teal-500/10 text-teal-600 border border-teal-400/30 px-2 py-0.5 rounded-full uppercase">
              Candidate
            </span>
          </Link>

          {/* 3 Clickable Navigation Tabs inside Navbar */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            {[
              { id: "insights",     label: "My Profile & AI Match",  icon: Sparkles },
              { id: "prep",         label: "Interview Prep Room",   icon: BookOpen },
              { id: "applications", label: "Application Pipeline",  icon: Target }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : `${txtSub} hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-indigo-500"}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right side controls: Theme Toggle, User Profile, Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border ${themeBtn} transition-colors`}
            title="Toggle Light/Dark Theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <div className={`flex items-center gap-2 pl-2 border-l ${divider}`}>
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className={`font-semibold ${isLight ? "text-slate-800" : "text-white"} leading-tight`}>
                {user?.name || "Alex Rivera"}
              </p>
              <p className={`${txtSub} text-[10px]`}>Candidate Portal</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl flex items-center gap-1 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Dashboard Content ───────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* ── Tab 1: My Profile & AI Match ─────────────────────────── */}
        {activeTab === "insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (5 cols): Candidate Profile & Resume Form */}
            <div className="lg:col-span-5 space-y-5">
              <div className={`rounded-2xl border ${card} p-6`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-indigo-600">Candidate Profile</h2>
                    <p className={`text-xs ${txtSub}`}>Update your resume, skills & experience</p>
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold bg-teal-500/10 border border-teal-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Synced
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Resume Upload Box */}
                  <div>
                    <label className={`block text-xs font-semibold ${txtMed} mb-1.5`}>
                      Upload Resume (PDF / DOCX)
                    </label>
                    <label className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isLight
                        ? "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70"
                        : "border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40"
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                            {resumeFileName}
                          </p>
                          <p className={`text-[10px] ${txtSub}`}>
                            Click or drag file to update candidate resume
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* DOB & Experience Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${txtMed} mb-1.5 flex items-center gap-1`}>
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Date of Birth (DOB)
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl border outline-none transition-colors ${inputBg}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${txtMed} mb-1.5 flex items-center gap-1`}>
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="40"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 8.5"
                        className={`w-full text-xs px-3 py-2 rounded-xl border outline-none transition-colors ${inputBg}`}
                        required
                      />
                    </div>
                  </div>

                  {/* Technical Skills Input & Tags */}
                  <div>
                    <label className={`block text-xs font-semibold ${txtMed} mb-1.5`}>
                      Technical Skills
                    </label>
                    <div className="flex gap-2 mb-2.5">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                        placeholder="Type skill & press Enter (e.g. Go, AWS)"
                        className={`flex-1 text-xs px-3 py-2 rounded-xl border outline-none transition-colors ${inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className={`text-[11px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${tag} group`}
                        >
                          <Check className="w-3 h-3 text-teal-500" />
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-500 transition-colors ml-0.5"
                            title="Remove skill"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {skills.length === 0 && (
                        <p className={`text-xs ${txtSub} italic py-1`}>No technical skills added yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Save Profile Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        saveSuccess
                          ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Updating AI Match Rubrics...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCheck className="w-4 h-4" />
                          Profile Saved Successfully!
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Save Profile & Update AI Matching
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick AI Competencies Summary Card */}
              <div className={`rounded-2xl border ${card} p-5`}>
                <h3 className={`font-extrabold text-[11px] uppercase tracking-widest ${txtSub} mb-3`}>
                  AI-Extracted Verification Summary
                </h3>
                <div className={`p-3 rounded-xl border ${inner} space-y-2 text-xs`}>
                  <div className="flex justify-between items-center">
                    <span className={txtSub}>Parsed Experience Level</span>
                    <span className="font-bold text-teal-600">{experience} Years (Senior)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={txtSub}>Core Verified Skills</span>
                    <span className="font-bold">{skills.length} Technical Attributes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={txtSub}>Top Requisition Match</span>
                    <span className="font-bold text-indigo-600">
                      {matchedRoles[0]?.title || "Distributed Systems"} ({matchedRoles[0]?.matchScore || 94}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Matching Hiring List & Live Job Search */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Header & Live Search Bar */}
              <div className={`rounded-2xl border ${card} p-5 space-y-3`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-bold text-indigo-600">Matching Hiring & Open Roles</h2>
                    <p className={`text-xs ${txtSub}`}>
                      Showing {filteredJobs.length} live requisitions scored against your skills & experience
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-teal-600 bg-teal-500/10 border border-teal-400/30 px-3 py-1 rounded-full">
                    {filteredJobs.length} Active Openings
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${txtSub}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job title, company name, location, or technical skills..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${inputBg}`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${txtSub} hover:text-slate-700`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Job Listings List */}
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className={`rounded-2xl border ${card} p-10 text-center space-y-2`}>
                    <p className="text-sm font-semibold">No matching roles found for "{searchQuery}"</p>
                    <p className={`text-xs ${txtSub}`}>Try searching for "Go", "Kafka", "Python", "AI", or "Remote"</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Reset search filter
                    </button>
                  </div>
                ) : (
                  filteredJobs.map((role) => (
                    <div key={role.id} className={`rounded-2xl border ${card} p-5 transition-all hover:border-indigo-400/40 hover:shadow-md`}>
                      {/* Role header with experience & recruiter skills */}
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div className="space-y-1">
                          <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                            {role.title}
                          </h3>
                          <div className={`flex items-center gap-3 text-xs ${txtSub} flex-wrap`}>
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <Building className="w-3.5 h-3.5 text-indigo-500" />
                              {role.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {role.location}
                            </span>
                            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              {role.experience_years ? `${role.experience_years}+ Yrs Exp` : "3+ Yrs Exp"}
                            </span>
                          </div>

                          {/* Recruiter Wanted Skills */}
                          {role.skills && role.skills.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase ${txtSub}`}>Required Skills:</span>
                              {role.skills.slice(0, 5).map((s) => (
                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-400/30 px-2.5 py-1 rounded-xl">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-sm font-black text-teal-600">{role.matchScore}%</span>
                          </div>
                          <p className={`text-[9px] uppercase font-bold tracking-wider ${txtSub} mt-0.5`}>
                            AI Match
                          </p>
                        </div>
                      </div>

                      {/* Qualifications & Missing Skills Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-3 text-xs">
                        <div className={`p-2.5 rounded-xl border ${isLight ? "bg-teal-50/60 border-teal-300/40" : "bg-teal-950/20 border-teal-500/20"}`}>
                          <p className={`font-bold text-[11px] mb-1 flex items-center gap-1.5 ${isLight ? "text-teal-800" : "text-teal-300"}`}>
                            <CheckCircle2 className="w-3 h-3 text-teal-500" />
                            Matched Qualifications
                          </p>
                          <p className={`text-[11px] ${txtMed}`}>{role.verifiedSkills.join(", ")}</p>
                        </div>

                        <div className={`p-2.5 rounded-xl border ${isLight ? "bg-amber-50/60 border-amber-300/40" : "bg-amber-950/20 border-amber-500/20"}`}>
                          <p className={`font-bold text-[11px] mb-1 flex items-center gap-1.5 ${isLight ? "text-amber-800" : "text-amber-300"}`}>
                            <ShieldAlert className="w-3 h-3 text-amber-500" />
                            To Be Evaluated in Interview
                          </p>
                          <p className={`text-[11px] ${txtMed}`}>{role.missingSkills.join(", ") || "General Architectural Depth"}</p>
                        </div>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className={`mt-3 pt-3 border-t ${divider} flex items-center justify-between text-xs`}>
                        <button
                          onClick={() => setActiveTab("prep")}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                        >
                          Practice interview questions for this role
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {applications.some(a => a.job_id === role.id) ? (
                          <span className="px-3.5 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 border border-teal-400/30 font-bold text-xs flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" />
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickApply(role)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            Quick Apply
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Interview Prep Room ─────────────────────────── */}
        {activeTab === "prep" && (
          <div className="space-y-5">
            <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-1">AI Interview Intelligence Room</h3>
              <p className="text-xs opacity-90">
                Practice answering role-specific questions curated by HireFlow's rubric generator for your matched requisitions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matchedRoles.slice(0, 4).map((role, i) => (
                <div key={i} className={`rounded-2xl border ${card} p-6 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{role.title}</h4>
                        <p className={`text-xs ${txtSub}`}>{role.company} • {role.location}</p>
                      </div>
                      <span className="text-xs font-bold text-teal-600 bg-teal-500/10 border border-teal-400/30 px-2 py-0.5 rounded-full">
                        {role.matchScore}% Match
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      {role.practiceQuestions.map((q, qIdx) => (
                        <div key={qIdx} className={`p-3.5 rounded-xl border ${inner}`}>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">Question {qIdx + 1}</span>
                          <p className={`text-xs font-medium ${isLight ? "text-slate-800" : "text-slate-200"} mt-1`}>"{q}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-6 pt-4 border-t ${divider} flex items-center justify-between text-xs`}>
                    <span className={txtSub}>Feedback readiness</span>
                    <span className="text-teal-600 font-bold">100% Prepared</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Application Pipeline ────────────────────────── */}
        {activeTab === "applications" && (
          <div className={`rounded-2xl border ${card} p-6 space-y-5`}>
            <div className="flex items-center justify-between">
            <div>
                <h3 className="font-extrabold text-base text-indigo-600">
                  Real-time Application & Shortlist Pipeline ({applications.length})
                </h3>
                <p className={`text-xs ${txtSub}`}>Track your candidate status from application submission to recruiter shortlisting & acceptance</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshApplications}
                  className={`p-2 rounded-xl border ${themeBtn} transition-colors`}
                  title="Refresh application status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-teal-600 bg-teal-500/10 border border-teal-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Live Status Synced
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className={`p-10 rounded-xl border ${inner} text-center space-y-2`}>
                  <p className="text-xs font-semibold">No applications submitted yet.</p>
                  <p className={`text-[11px] ${txtSub}`}>
                    Navigate to "My Profile & AI Match" tab and click "Quick Apply" on any role to apply.
                  </p>
                </div>
              ) : (
                applications.map((app, i) => {
                  const isAccepted = app.status === "Accepted"
                  const isRejected = app.status === "Rejected"
                  const isShortlisted = (app.status === "Shortlisted" || isAccepted) && !isRejected
                  const isInterview = app.status === "Interview Scheduled"

                  return (
                    <div key={i} className={`p-5 rounded-2xl border ${inner} space-y-4`}>
                      {/* Application Header */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            isAccepted ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : isRejected ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                            : "bg-indigo-600/10 text-indigo-600"
                          }`}>
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{app.job_title}</h4>
                            <p className={`text-xs ${txtSub}`}>{app.company} • Submitted: {app.submitted_at}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${
                            isAccepted
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/30"
                              : isRejected
                              ? "bg-red-500/10 text-red-600 border-red-400/30"
                              : isShortlisted
                              ? "bg-amber-500/10 text-amber-600 border-amber-400/30"
                              : isInterview
                              ? "bg-teal-500/10 text-teal-600 border-teal-400/30"
                              : "bg-blue-500/10 text-blue-600 border-blue-400/20"
                          }`}>
                            {isAccepted && "🎉 "}{isRejected && "❌ "}{app.stage || app.status}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Banner */}
                      {isRejected && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs flex items-center gap-3">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="font-extrabold text-sm">Application Not Selected</p>
                            <p className="text-[11px] opacity-90 mt-0.5">The recruiter has reviewed your application and decided not to proceed at this time. We encourage you to apply to other open roles.</p>
                          </div>
                        </div>
                      )}

                      {/* Celebration Message if Accepted */}
                      {isAccepted && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="font-extrabold text-sm">🎉 Congratulations! You have been Officially Accepted!</p>
                            <p className="text-[11px] opacity-90 mt-0.5">The recruiter has manually accepted your application after shortlisting review. Your offer letter / onboarding details are in preparation.</p>
                          </div>
                        </div>
                      )}

                      {/* Visual Multi-step Pipeline Bar — 4 Steps */}
                      <div className="pt-2">
                        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                          {/* Step 1: Application Submitted */}
                          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
                          }`}>
                            <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px]">✓</div>
                            <span className="text-teal-600 dark:text-teal-400">1. Applied</span>
                          </div>

                          {/* Step 2: Shortlisted */}
                          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            isShortlisted
                              ? isLight ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-amber-950/30 border-amber-500/30 text-amber-300"
                              : isRejected ? "opacity-20" : "opacity-40"
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isShortlisted ? "bg-amber-500 text-white" : "bg-slate-300 text-slate-600"
                            }`}>{isShortlisted ? "✓" : "2"}</div>
                            <span>2. Shortlisted ⭐</span>
                          </div>

                          {/* Step 3: Interview Scheduled */}
                          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            isInterview
                              ? isLight ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-teal-950/30 border-teal-500/30 text-teal-300"
                              : isRejected ? "opacity-20" : "opacity-40"
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isInterview ? "bg-teal-500 text-white" : "bg-slate-300 text-slate-600"
                            }`}>{isInterview ? "✓" : "3"}</div>
                            <span>3. Interview 📅</span>
                          </div>

                          {/* Step 4: Accepted or Rejected */}
                          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            isAccepted
                              ? isLight ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-bold"
                              : isRejected
                              ? isLight ? "bg-red-50 border-red-300 text-red-700" : "bg-red-950/30 border-red-500/30 text-red-300 font-bold"
                              : "opacity-40"
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isAccepted ? "bg-emerald-600 text-white font-bold"
                              : isRejected ? "bg-red-500 text-white"
                              : "bg-slate-300 text-slate-600"
                            }`}>{isAccepted ? "🎉" : isRejected ? "✕" : "4"}</div>
                            <span>{isRejected ? "4. Rejected ❌" : "4. Accepted 🎉"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
