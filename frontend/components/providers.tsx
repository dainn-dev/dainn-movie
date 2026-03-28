"use client"

import type { ReactNode } from "react"
import { ChatSystem } from "@/components/chat-system"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <ChatSystem />
      <Toaster />
    </AuthProvider>
  )
}
