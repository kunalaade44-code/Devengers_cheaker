import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Search, FileText, UserX, Clock } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const problems = [
  {
    icon: <Search className="w-6 h-6 text-indigo-600" />,
    title: "Buried Candidate Info",
    description: "Critical details are lost in unstructured PDFs, making it impossible to search or compare at scale."
  },
  {
    icon: <Clock className="w-6 h-6 text-indigo-600" />,
    title: "Manual Screening",
    description: "Recruiters spend hours reading resumes instead of building relationships with top talent."
  },
  {
    icon: <UserX className="w-6 h-6 text-indigo-600" />,
    title: "Inconsistent Evaluations",
    description: "Without standardized criteria, hiring decisions are often driven by gut feeling and bias."
  },
  {
    icon: <FileText className="w-6 h-6 text-indigo-600" />,
    title: "Unprepared Interviewers",
    description: "Hiring managers enter interviews without clear, role-specific questions or context."
  }
]

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    gsap.fromTo(
      cardsRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
        }
      }
    )
  }, [])

  return (
    <section ref={sectionRef} id="problem" className="py-24 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            The hiring process is broken
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Traditional recruiting relies on unstructured data and manual effort, leading to missed opportunities and slow hiring cycles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, i) => (
            <div 
              key={i}
              ref={el => { cardsRef.current[i] = el }}
              className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                {problem.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
