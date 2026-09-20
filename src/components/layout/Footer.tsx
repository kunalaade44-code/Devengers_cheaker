import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
    }
  }

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-12 border-t border-slate-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              HireFlow
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                AI Agent
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm mb-6">
              Empowering talent leaders with AI-driven resume scoring, customized interview kits, and auditable evidence pipelines.
            </p>
            <div className="flex gap-3 text-slate-600 dark:text-slate-400">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors text-xs font-bold">
                𝕏
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors text-xs font-bold">
                in
              </a>
              <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors text-xs font-bold">
                GH
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#product" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Smart Resume Parsing</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Audit Trail Engine</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Interview Kit Generator</a></li>
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#use-cases" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Startups Scaling</a></li>
              <li><a href="#use-cases" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Enterprise TA Teams</a></li>
              <li><a href="#use-cases" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Staffing Agencies</a></li>
              <li><Link to="/signin" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Recruiter Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter / Stay in Touch */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Stay Ahead</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Get the bi-weekly newsletter on modern talent intelligence & AI screening practices.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  Subscribe
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} HireFlow Inc. All rights reserved. SOC2 Type II Certified.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security & Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
