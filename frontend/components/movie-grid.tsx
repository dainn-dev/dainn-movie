import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowRight } from "lucide-react"
import { fetchMoviesForGridCategory } from "@/lib/movies-grid-data"

export default async function MovieGrid({ category = "popular" }: { category?: string }) {
  const movieList = await fetchMoviesForGridCategory(category)

  if (!movieList.length) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Không có phim để hiển thị. Kiểm tra API hoặc dữ liệu.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movieList.map((movie) => (
        <Card key={movie.id} className="border-0 overflow-hidden group">
          <CardContent className="p-0 relative">
            <Link href={`/movies/${movie.id}`}>
              <div className="relative">
                <Image
                  src={movie.posterUrl || "/placeholder.svg"}
                  alt={movie.title}
                  width={185}
                  height={284}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="text-white text-sm font-medium flex items-center">
                    Xem thêm <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
            <div className="p-3">
              <h6 className="text-sm font-medium truncate">
                <Link href={`/movies/${movie.id}`}>{movie.title}</Link>
              </h6>
              <p className="flex items-center text-xs text-muted-foreground">
                <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                <span>{movie.avgRating || "—"}</span>
                {movie.avgRating > 0 ? " /10" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
