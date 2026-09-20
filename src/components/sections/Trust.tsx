import { UserCheck, Cpu, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function Trust() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
          AI Assists. Humans Decide.
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-16 max-w-2xl mx-auto">
          HireFlow is built on a "Human in the Loop" philosophy. We structure the data and highlight the evidence, so your team can make fair, unbiased decisions faster.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Cpu className="w-10 h-10 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">AI Extracts Insights</h4>
            <p className="text-sm text-neutral-500 max-w-[200px] mt-2">Processes resumes and interview notes to surface evidence.</p>
          </div>

          <motion.div 
            animate={{ x: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="hidden md:block"
          >
            <ArrowRight className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="md:hidden"
          >
            <ArrowRight className="w-8 h-8 text-neutral-300 dark:text-neutral-700 rotate-90" />
          </motion.div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4">
              <UserCheck className="w-10 h-10 text-teal-600" />
            </div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">Human Makes Call</h4>
            <p className="text-sm text-neutral-500 max-w-[200px] mt-2">Reviews the structured data and makes the final hiring decision.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
