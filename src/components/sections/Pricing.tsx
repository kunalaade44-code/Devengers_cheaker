import { Check, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/Button"

const tiers = [
  {
    name: "Growth",
    price: "$249",
    period: "/month",
    description: "For scaling talent teams wanting high-speed screening and interview generation.",
    features: [
      "Up to 250 active candidate screens / mo",
      "AI resume parsing & evidence mapping",
      "Automated custom interview kits",
      "Natural language talent search",
      "Email & Slack support",
    ],
    cta: "Start Free Trial",
    popular: false,
    highlight: false,
  },
  {
    name: "Professional",
    price: "$599",
    period: "/month",
    description: "For high-growth engineering & recruiting organizations needing deep rubric alignment.",
    features: [
      "Up to 1,000 candidate screens / mo",
      "All Growth features included",
      "Interview audio/transcript summarization",
      "Audit trail compliance reports",
      "Custom rubric scoring models",
      "Dedicated account strategist",
    ],
    cta: "Get Started",
    popular: true,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For global enterprises requiring custom SLAs, dedicated models, and ATS integrations.",
    features: [
      "Unlimited candidate pipelines",
      "Self-hosted / Private VPC deployment",
      "Workday, Greenhouse & Lever deep sync",
      "SOC2 & GDPR enterprise compliance",
      "24/7 priority support & custom SLA",
    ],
    cta: "Contact Sales",
    popular: false,
    highlight: false,
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Invest in hiring confidence
          </h2>
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Scale your team with transparent, predictable pricing. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.highlight
                  ? "bg-gradient-to-b from-indigo-900/40 via-neutral-900 to-neutral-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10"
                  : "bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-teal-400 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 min-h-[40px]">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl md:text-5xl font-extrabold">{tier.price}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    {tier.period}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/signup" className="w-full">
                <Button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    tier.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Big CTA Banner Band */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-bold mb-4">
              Ready to transform your hiring pipeline?
            </h3>
            <p className="text-slate-300 text-sm md:text-base mb-8 max-w-xl mx-auto">
              Join leading recruitment teams saving 15+ hours per requisition while boosting hire quality with auditable evidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-slate-100 font-bold px-8 py-3 rounded-xl">
                  Book a 15-Min Demo
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
