import type React from "react"
import type { Metadata } from "next"
import { Nunito, Dosis } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600"],
})

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-dosis",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Open Pediatrics",
  description: "Open Pediatrics - Healthcare for children",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${dosis.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
