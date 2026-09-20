import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Rocket, Briefcase } from "lucide-react"

const useCases = [
  {
    id: "startups",
    title: "Startups Scaling Fast",
    icon: <Rocket className="w-5 h-5" />,
    content: "When headcount doubles every quarter, you can't afford bad hires. HireFlow lets lean talent teams screen thousands of applicants instantly, ensuring every interview is spent with high-signal candidates."
  },
  {
    id: "enterprise",
    title: "Enterprise TA Teams",
    icon: <Building2 className="w-5 h-5" />,
    content: "Standardize your hiring rubrics across global offices. HireFlow enforces consistent interview structures and generates compliance-ready audit trails for every hiring decision."
  },
  {
    id: "agencies",
    title: "Staffing Agencies",
    icon: <Briefcase className="w-5 h-5" />,
    content: "Differentiate your firm by submitting candidates with AI-generated evidence scorecards, not just formatted resumes. Query your entire historical talent pool to find perfect matches in seconds."
  }
]

export function UseCases() {
  const [activeTab, setActiveTab] = useState(useCases[0].id)

  return (
    <section id="use-cases" className="py-24 bg-white dark:bg-neutral-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Built for modern hiring teams
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="flex flex-col w-full md:w-1/3 gap-2">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setActiveTab(useCase.id)}
                className={`relative px-6 py-4 text-left rounded-xl transition-colors ${
                  activeTab === useCase.id 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
                }`}
              >
                {activeTab === useCase.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3 font-semibold">
                  {useCase.icon}
                  {useCase.title}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full md:w-2/3 min-h-[200px] flex items-center">
            <AnimatePresence mode="wait">
              {useCases.map((useCase) => 
                activeTab === useCase.id ? (
                  <motion.div
                    key={useCase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8"
                  >
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                      {useCase.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                      {useCase.title}
                    </h3>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {useCase.content}
                    </p>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
