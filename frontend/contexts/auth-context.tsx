"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null })
  // keep a ref so refresh timer closure always sees latest token
  const tokenRef = useRef<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── helpers ────────────────────────────────────────────────────────────────
  function scheduleRefresh(expiresInMs: number) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    // refresh 30s before expiry
    const delay = Math.max(expiresInMs - 30_000, 5_000)
    refreshTimerRef.current = setTimeout(silentRefresh, delay)
  }

  function parseExpiry(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp * 1000 - Date.now()
    } catch {
      return 10 * 60 * 1000 // fallback 10 min
    }
  }

  function applyTokens(accessToken: string, user: User) {
    tokenRef.current = accessToken
    setState({ user, accessToken })
    scheduleRefresh(parseExpiry(accessToken))
  }

  function clearAuth() {
    tokenRef.current = null
    setState({ user: null, accessToken: null })
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
  }

  // ── silent refresh (called by timer + on mount) ────────────────────────────
  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // refreshToken is sent via httpOnly cookie — body is intentionally empty
        // The server reads the cookie named "refreshToken"
        body: JSON.stringify({ refreshToken: "" }),
        credentials: "include",
      })
      if (!res.ok) { clearAuth(); return null }
      const data = await res.json()
      applyTokens(data.accessToken, data.user)
      return data.accessToken as string
    } catch {
      clearAuth()
      return null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On mount — attempt silent refresh to restore session from httpOnly cookie
  useEffect(() => {
    silentRefresh()
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [silentRefresh])

  // ── public actions ─────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // server sets httpOnly refreshToken cookie
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return (data as { message?: string }).message ?? "Đăng nhập thất bại."
    }
    const data = await res.json()
    applyTokens(data.accessToken, data.user)
    return null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        },
        body: JSON.stringify({ refreshToken: "" }), // server reads cookie
        credentials: "include",
      })
    } finally {
      clearAuth()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshAccessToken = useCallback(silentRefresh, [silentRefresh])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
