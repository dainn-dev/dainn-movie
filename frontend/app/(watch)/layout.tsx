import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function WatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-4 py-3 flex items-center gap-4 bg-black/90 backdrop-blur sticky top-0 z-50">
        <Link href="/movies" className="text-sm text-white/70 hover:text-white flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Phim
        </Link>
      </header>
      {children}
    </div>
  )
}
