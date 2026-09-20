import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Briefcase, User, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth, type UserRole } from "../context/AuthContext"
import { api } from "../lib/api"

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState<UserRole>("recruiter")
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFillDemo = (demoRole: UserRole) => {
    setErrorMessage(null)
    setRole(demoRole)
    if (demoRole === "recruiter") {
      setForm({ email: "recruiter@hireflow.ai", password: "password123" })
    } else {
      setForm({ email: "candidate@hireflow.ai", password: "password123" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const res = await api.login({
        email: form.email,
        password: form.password,
        role: role
      })

      if (res.user) {
        login(res.user)
        if (role === "recruiter") {
          navigate("/recruiter/dashboard")
        } else {
          navigate("/candidate/dashboard")
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-200">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-30 dark:opacity-70 blur-[50px] pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 opacity-25 dark:opacity-60 blur-[50px] pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/95 dark:bg-[#16161c]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-8 py-9 shadow-2xl transition-colors duration-200"
      >
        {/* Back to Home & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            ← Back to Home
          </Link>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">HIREFLOW</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Login Here</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Select your portal role to access your dashboard.</p>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-[#0f0f14] rounded-xl p-1 border border-slate-200 dark:border-white/5">
          {(["recruiter", "candidate"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r)
                setErrorMessage(null)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                role === r
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {r === "recruiter" ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {r}
            </button>
          ))}
        </div>

        {/* Demo Quick Fills */}
        <div className="flex items-center justify-between mb-5 px-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Quick Demo Credentials:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo("recruiter")}
              className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold hover:bg-indigo-100 transition-colors"
            >
              Demo Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("candidate")}
              className="px-2 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold hover:bg-teal-100 transition-colors"
            >
              Demo Candidate
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 shadow-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  {role === "recruiter" ? "Work Email" : "Email Address"}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder={role === "recruiter" ? "sarah@company.com" : "alex@developer.io"}
                  className="w-full bg-slate-50 dark:bg-[#22222a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 dark:bg-[#22222a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm mb-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    Enter {role === "recruiter" ? "Recruiter Portal" : "Candidate Portal"}
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
