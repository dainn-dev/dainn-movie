"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play, ChevronRight } from "lucide-react"
import type { MovieTrailerDto } from "@/types/api"

function toEmbedUrl(raw: string): string {
  const u = raw.trim()
  if (u.includes("youtube.com/embed") || u.includes("player.vimeo.com")) return u
  try {
    const url = new URL(u)
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : u
    }
    const v = url.searchParams.get("v")
    if (url.hostname.includes("youtube.com") && v) {
      return `https://www.youtube.com/embed/${v}`
    }
  } catch {
    /* ignore */
  }
  return u
}

export default function TrailerSectionClient({ trailers }: { trailers: MovieTrailerDto[] }) {
  const [active, setActive] = useState(trailers[0] ?? null)

  if (!trailers.length) {
    return (
      <section className="py-12 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Trailer</h2>
          <p className="text-muted-foreground text-sm">Chưa có phim nào có trailer.</p>
        </div>
      </section>
    )
  }

  const current = active ?? trailers[0]!
  const embed = toEmbedUrl(current.trailerUrl)

  return (
    <section className="py-12 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trailer</h2>
          <Link href="/movies" className="text-sm flex items-center hover:text-primary">
            Xem phim <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={embed}
                className="absolute inset-0 w-full h-full"
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-2 text-sm font-medium">
              <Link href={`/movies/${current.id}`} className="hover:text-primary">
                {current.title}
              </Link>
            </p>
          </div>

          <div className="md:col-span-1">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {trailers.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer ${current.id === t.id ? "border-primary" : ""}`}
                  onClick={() => setActive(t)}
                >
                  <CardContent className="p-3 flex gap-3">
                    <div className="relative w-24 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <Image
                        src={t.posterUrl || "/placeholder.svg"}
                        alt={t.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2">{t.title}</h4>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
