import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import { LayoutDashboard } from "lucide-react"
import { Button } from "../ui/Button"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

export function Navbar() {
  const { scrollY } = useScroll()
  const { user } = useAuth()
  const { theme } = useTheme()
  
  // Dynamic blur and background on scroll adapting to theme
  const background = useTransform(
    scrollY,
    [0, 50],
    theme === "dark" 
      ? ["rgba(12, 12, 16, 0)", "rgba(12, 12, 16, 0.95)"]
      : ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  )
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  )

  const dashboardPath = user?.role === "candidate" ? "/candidate/dashboard" : "/recruiter/dashboard"

  return (
    <motion.nav
      style={{ background, backdropFilter }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-colors duration-300 border-b border-slate-200 dark:border-white/10"
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity">
          HireFlow
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#product" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Product</a>
          <a
            href="#how-it-works"
            className="hover:text-indigo-600 dark:hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault()
              const section = document.getElementById('how-it-works')
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >How it Works</a>
          <a href="#use-cases" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Use Cases</a>
        </div>
      </div>
      
      <div className="flex items-center gap-3">

        {user ? (
          <Link to={dashboardPath}>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Portal
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/signin">
              <Button variant="outline" className="hidden sm:inline-flex bg-sky-500/20 border-sky-400/60 text-sky-300 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all duration-200">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  )
}

