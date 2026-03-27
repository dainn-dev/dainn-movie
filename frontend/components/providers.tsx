"use client"

import type { ReactNode } from "react"
import { ChatSystem } from "@/components/chat-system"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <ChatSystem />
    </>
  )
}
