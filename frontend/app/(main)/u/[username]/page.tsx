import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchWithTimeout } from "@/lib/server-fetch"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

interface PublicProfile {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  joinedAt: string
  stats: { moviesUploaded: number; friends: number; reviews: number }
}

export default async function PublicUserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  if (!API) notFound()
  const res = await fetchWithTimeout(`${API}/api/users/${encodeURIComponent(username)}`, { next: { revalidate: 120 } })
  if (!res.ok) notFound()
  const p = (await res.json()) as PublicProfile

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Image
          src={p.avatarUrl || "/placeholder.svg"}
          alt={p.displayName}
          width={120}
          height={120}
          className="rounded-full border object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{p.displayName}</h1>
          <p className="text-muted-foreground">@{p.username}</p>
          {p.bio && <p className="mt-4 text-sm whitespace-pre-wrap">{p.bio}</p>}
          <p className="mt-4 text-xs text-muted-foreground">Tham gia {new Date(p.joinedAt).toLocaleDateString()}</p>
          <div className="flex gap-6 mt-4 text-sm">
            <span>{p.stats.moviesUploaded} phim</span>
            <span>{p.stats.friends} bạn</span>
            <span>{p.stats.reviews} review</span>
          </div>
          <div className="mt-6">
            <ButtonLink href={`/user/friends`}>Mời kết bạn (từ trang Bạn bè)</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}

function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
    >
      {children}
    </Link>
  )
}
