import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { fetchWithTimeout } from "@/lib/server-fetch"
import type { CelebrityListDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function FeaturedCelebrities() {
  let celebrities: CelebrityListDto[] = []
  if (API) {
    const p = new URLSearchParams({ featured: "true", page: "1", pageSize: "8" })
    const res = await fetchWithTimeout(`${API}/api/celebrities?${p}`, { next: { revalidate: 300 } })
    if (res.ok) {
      const body = (await res.json()) as PagedResult<CelebrityListDto>
      celebrities = body.data ?? []
    }
  }

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow p-4 border border-border">
      <h4 className="text-lg font-bold mb-4">Nghệ sĩ nổi bật</h4>
      {!celebrities.length ? (
        <p className="text-sm text-muted-foreground py-4">Chưa có dữ liệu.</p>
      ) : (
        <div className="space-y-4">
          {celebrities.map((celebrity) => (
            <div key={celebrity.id} className="flex items-center space-x-3">
              <Link href={`/celebrities/${celebrity.slug}`}>
                <Image
                  src={celebrity.avatarUrl || "/placeholder.svg"}
                  alt={celebrity.name}
                  width={70}
                  height={70}
                  className="rounded-full object-cover w-[70px] h-[70px]"
                />
              </Link>
              <div>
                <h6 className="font-medium">
                  <Link href={`/celebrities/${celebrity.slug}`} className="hover:text-primary">
                    {celebrity.name}
                  </Link>
                </h6>
                <span className="text-sm text-muted-foreground">
                  {celebrity.movieCount} phim
                  {celebrity.country ? ` · ${celebrity.country}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Button variant="outline" className="w-full flex items-center justify-center" asChild>
          <Link href="/celebrities">
            Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
