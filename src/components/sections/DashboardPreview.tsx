import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CheckCircle2, Sparkles, FileText, Check } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mockupRef.current || !containerRef.current) return

    gsap.fromTo(
      mockupRef.current,
      { y: 60, scale: 0.94, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top 40%",
          scrub: 0.8,
        }
      }
    )
  }, [])

  return (
    <section ref={containerRef} className="py-24 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Candidate Intelligence at a Glance
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time scorecards, rubric alignment, gap alerts, and verifiable source quotes all in one unified view.
          </p>
        </div>

        {/* Mockup Container */}
        <div
          ref={mockupRef}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#121217]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto transition-colors duration-200"
        >
          {/* Mockup Header bar */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-2">
                Pipeline: Senior Distributed Systems Engineer (Role #REQ-409)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 px-2.5 py-1 rounded-full font-medium">
                42 Resumes Analyzed
              </span>
              <span className="text-xs bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 dark:border-teal-500/30 px-2.5 py-1 rounded-full font-medium">
                98.4% Match Accuracy
              </span>
            </div>
          </div>

          {/* Main Mockup Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate Card */}
            <div className="lg:col-span-1 bg-slate-50 dark:bg-[#1a1a22] border border-slate-200 dark:border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center font-bold text-white text-sm">
                    AK
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Alex Rivera</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Staff Backend Engineer</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">94%</span>
                  <p className="text-[10px] text-slate-400 uppercase">Fit Score</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Experience:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">8.5 Years</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Primary Stack:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Go, Rust, K8s, Kafka</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Audit Confidence:</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">High (12 citations)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Verified Competencies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Distributed Consensus", "gRPC", "High Throughput", "PostgreSQL", "Observability"].map((tag, i) => (
                    <span key={i} className="text-[10px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 text-teal-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-[#1a1a22] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Requirement Rubric Alignment
                  </h4>
                  <span className="text-xs text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    5/5 Criteria Met
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { req: "5+ years in high-concurrency distributed systems", status: "Verified (Lead architect at FinTech startup)", score: 98 },
                    { req: "Experience building low-latency stream processing", status: "Verified (Kafka + Flink pipeline citation)", score: 92 },
                    { req: "Cross-functional mentorship & RFC authoring", status: "Verified (Authored 14 architectural RFCs)", score: 90 },
                  ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-800 dark:text-slate-200">{item.req}</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">{item.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Natural Language Prompt Query Preview */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="italic">
                      "Show candidates with experience scaling payment throughput &gt;50k TPS"
                    </span>
                  </div>
                  <span className="text-[10px] bg-indigo-600 text-white font-semibold px-2 py-1 rounded">
                    3 Matches Found
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
