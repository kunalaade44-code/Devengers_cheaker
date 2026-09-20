export function Testimonials() {
  const logos = ["Acme Corp", "GlobalTech", "Innovate Inc", "Nexus Solutions", "Synergy"]

  return (
    <section className="py-24 bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-12">
          Trusted by Talent Leaders At
        </h3>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
          {logos.map((logo, i) => (
            <div 
              key={i}
              className="text-2xl font-bold text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition-colors duration-300 cursor-pointer grayscale hover:grayscale-0"
            >
              {logo}
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-4xl mx-auto">
          <div className="relative p-10 md:p-14 bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <div className="absolute top-8 left-8 text-6xl text-indigo-200 dark:text-indigo-900/50 font-serif">"</div>
            <p className="relative z-10 text-xl md:text-3xl text-neutral-900 dark:text-white font-medium leading-relaxed text-center mb-8">
              HireFlow cut our time-to-hire by 40% while improving the quality of our engineering screens. It's like having a dedicated talent analyst for every open role.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
              <div className="text-left">
                <div className="font-semibold text-neutral-900 dark:text-white">Sarah Jenkins</div>
                <div className="text-sm text-neutral-500">VP of Talent, GlobalTech</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
