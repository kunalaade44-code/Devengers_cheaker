import React, { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "recruiter" | "candidate"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company?: string
  token?: string
}

interface AuthContextType {
  user: User | null
  login: (userOrEmail: User | string, role?: UserRole, name?: string, company?: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("hireflow_user")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem("hireflow_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("hireflow_user")
    }
  }, [user])

  const login = (userOrEmail: User | string, role?: UserRole, name?: string, company?: string) => {
    if (typeof userOrEmail === "object") {
      setUser(userOrEmail)
      return
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: userOrEmail,
      name: name || userOrEmail.split("@")[0].charAt(0).toUpperCase() + userOrEmail.split("@")[0].slice(1),
      role: role || "recruiter",
      company: role === "recruiter" ? (company?.trim() || "XYZ") : undefined,
      token: `mock_jwt_${Date.now()}`
    }
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
