import { motion } from "framer-motion"
import { FileSearch, MapPin, Mic, FileText, Search, ShieldCheck } from "lucide-react"

const features = [
  { icon: FileSearch, title: "Smart Resume Parsing", desc: "Extract beyond keywords to understand real accomplishments and context." },
  { icon: MapPin, title: "Requirement Mapping", desc: "Instantly see how candidate skills map to your specific job rubric." },
  { icon: Mic, title: "AI-Generated Interview Kits", desc: "Equip hiring managers with tailored questions to probe identified gaps." },
  { icon: FileText, title: "Interview Summarization", desc: "Turn raw transcripts into structured scorecards aligned to your framework." },
  { icon: Search, title: "Natural Language Search", desc: "Find past candidates by asking 'Who has B2B SaaS marketing experience?'" },
  { icon: ShieldCheck, title: "Full Audit Trail", desc: "Every AI insight links back to the original resume or interview quote." }
]

export function FeatureGrid() {
  return (
    <section id="product" className="py-24 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Intelligence at every step
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to remove bias and accelerate evidence-based hiring.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="group p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-default"
              >
                <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-neutral-100 dark:border-neutral-700 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
