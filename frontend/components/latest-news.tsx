import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { fetchWithTimeout } from "@/lib/server-fetch"
import type { NewsListDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function LatestNews() {
  let items: NewsListDto[] = []
  if (API) {
    const p = new URLSearchParams({ page: "1", pageSize: "6" })
    const res = await fetchWithTimeout(`${API}/api/news?${p}`, { next: { revalidate: 120 } })
    if (res.ok) {
      const body = (await res.json()) as PagedResult<NewsListDto>
      items = body.data ?? []
    }
  }

  const [headline, ...rest] = items

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Tin mới</h2>

        {!headline && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Chưa có bài viết. Thêm tin trong CMS / database.
          </p>
        )}

        {headline && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:w-1/4">
              <Image
                src={headline.coverUrl || "/placeholder.svg"}
                alt={headline.title}
                width={170}
                height={250}
                className="w-full h-auto rounded-md"
              />
            </div>
            <div className="md:w-3/4">
              <h3 className="text-lg font-medium mb-1">
                <Link href={`/news/${headline.slug}`} className="hover:text-primary">
                  {headline.title}
                </Link>
              </h3>
              <span className="text-sm text-muted-foreground block mb-2">
                {new Date(headline.publishedAt).toLocaleDateString("vi-VN")} · {headline.authorName}
              </span>
              <div className="flex gap-1 flex-wrap">
                {headline.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Thêm tin</h3>
              <Link href="/news" className="text-sm flex items-center hover:text-primary">
                Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {rest.slice(0, Math.ceil(rest.length / 2)).map((item) => (
                  <div key={item.id}>
                    <h6 className="text-sm font-medium">
                      <Link href={`/news/${item.slug}`} className="hover:text-primary">
                        {item.title}
                      </Link>
                    </h6>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {rest.slice(Math.ceil(rest.length / 2)).map((item) => (
                  <div key={item.id}>
                    <h6 className="text-sm font-medium">
                      <Link href={`/news/${item.slug}`} className="hover:text-primary">
                        {item.title}
                      </Link>
                    </h6>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
