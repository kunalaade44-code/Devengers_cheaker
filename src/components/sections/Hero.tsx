import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Sparkles, ShieldCheck } from "lucide-react"
import { HeroBackground } from "../ui/HeroBackground"
import { ThreeBackground } from "../ui/3DBackground"

/*
  ========================================================================
  FUTURE BACKEND ARCHITECTURE ROADMAP (for engineering team reference)
  - Backend API: Python (FastAPI) async endpoints for ingestion & query
  - LLM Pipeline: LangChain / LlamaIndex pipeline for multi-pass resume parsing & rubric matching
  - Database: PostgreSQL (SQLAlchemy / Alembic) for relational candidates & audit scores
  - Vector Store: Pinecone / pgvector with OpenAI text-embedding-3-small for semantic candidate search
  ========================================================================
*/

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const trustBadgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(
      headlineRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.1 }
    )
    .fromTo(
      subheadlineRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.6"
    )
    .fromTo(
      trustBadgeRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      "-=0.3"
    )
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Video layer with ambient overlay */}
      <HeroBackground />

      {/* Lightweight 3D neural network skill particle graph */}
      <ThreeBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Next-Gen Candidate Intelligence</span>
        </div>

        {/* Main Headline */}
        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.12] text-slate-900 dark:text-white"
        >
          Screen Smarter.<br />Interview Sharper.<br />
          <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-sky-600 dark:from-teal-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Hire with Evidence.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
        >
          Transform raw resumes and interview transcripts into structured, auditable candidate intelligence. Built for high-velocity recruiting teams.
        </p>

        {/* Trust badge */}
        <div
          ref={trustBadgeRef}
          className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>SOC2 Type II Ready • 100% Traceable Audit Trails • Zero Black-box Scoring</span>
        </div>
      </div>
    </section>
  )
}
