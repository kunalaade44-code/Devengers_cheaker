import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Upload, Brain, Network, ListChecks, MessageSquare, BookOpen, ShieldAlert, Sparkles } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { icon: <Upload />, title: "Upload Data", desc: "Upload job description + resumes in bulk." },
  { icon: <Brain />, title: "AI Extraction", desc: "Extracts skills, experience, projects, qualifications." },
  { icon: <Network />, title: "Requirement Mapping", desc: "Maps candidates against role requirements, flags gaps." },
  { icon: <ListChecks />, title: "Rank & Group", desc: "Groups & ranks candidates with structured summaries." },
  { icon: <MessageSquare />, title: "Interview Prep", desc: "Auto-generates role-specific + follow-up interview questions." },
  { icon: <BookOpen />, title: "Summarize Interviews", desc: "Summarizes notes, maps evidence to requirements." },
  { icon: <ShieldAlert />, title: "Identify Gaps", desc: "Flags unanswered evaluation areas, generates standardized report." },
  { icon: <Sparkles />, title: "Semantic Search", desc: "Query entire candidate pool in natural language." }
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {

      const totalCardWidth = trackRef.current!.scrollWidth - window.innerWidth

      gsap.to(trackRef.current, {
        x: () => -totalCardWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${totalCardWidth}`,
          invalidateOnRefresh: true,
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-slate-50 dark:bg-neutral-950"
    >
      {/* Fixed header inside the pinned section */}
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="pt-28 pb-8 px-6 md:px-12 text-center flex-shrink-0">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-3">
            How HireFlow Works
          </h2>
          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            From raw resume to finalized hire. Every insight has a traceable audit trail back to source data.
          </p>
          {/* Progress indicator */}
          <div className="mt-4 flex items-center justify-center gap-1">
            {steps.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-200 dark:bg-indigo-900" />
            ))}
          </div>
        </div>

        {/* Horizontal track — starts at left edge, last card ends at right edge */}
        <div
          ref={trackRef}
          className="flex flex-nowrap items-stretch flex-1 pb-8"
          style={{ paddingLeft: "5vw", paddingRight: "5vw" }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="step-card flex-shrink-0 px-3"
              style={{ width: "clamp(280px, 30vw, 380px)" }}
            >
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-7 shadow-xl border border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                    Step {i + 1} / {steps.length}
                  </div>
                  {i === steps.length - 1 && (
                    <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Final
                    </span>
                  )}
                </div>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/25 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed flex-grow">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
