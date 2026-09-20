export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Light mode high-resolution aesthetic background image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-85 dark:opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundImage: "url('/hero-light-bg.jpg')" }}
      />

      {/* Dark mode animated hero video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-0 dark:opacity-40 transition-opacity duration-500 pointer-events-none"
      >
        <source src="/HeroBackground.mp4" type="video/mp4" />
      </video>

      {/* Ambient gradient overlay to blend smoothly into page content */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white dark:from-slate-950/40 dark:via-slate-950/70 dark:to-slate-950 transition-colors duration-300 pointer-events-none" />
    </div>
  )
}
