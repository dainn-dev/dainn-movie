"use client"

import type { ReactNode } from "react"
import { ChatSystem } from "@/components/chat-system"
import { AuthProvider } from "@/contexts/auth-context"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <ChatSystem />
    </AuthProvider>
  )
}
