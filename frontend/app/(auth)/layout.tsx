import type React from "react"
import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8">
        <Image src="/images/logo1.png" alt="DMovie" width={119} height={58} priority />
      </Link>
      {children}
    </div>
  )
}
