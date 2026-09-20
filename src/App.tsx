
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "./components/layout/Navbar"
import { Footer } from "./components/layout/Footer"
import { Hero } from "./components/sections/Hero"
import { Problem } from "./components/sections/Problem"
import { HowItWorks } from "./components/sections/HowItWorks"
import { FeatureGrid } from "./components/sections/FeatureGrid"
import { Trust } from "./components/sections/Trust"
import { UseCases } from "./components/sections/UseCases"
import { DashboardPreview } from "./components/sections/DashboardPreview"
import { Pricing } from "./components/sections/Pricing"
import { Testimonials } from "./components/sections/Testimonials"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard"
import CandidateDashboard from "./pages/candidate/CandidateDashboard"

function LandingPage() {
  return (
    <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <FeatureGrid />
        <Trust />
        <UseCases />
        <DashboardPreview />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

