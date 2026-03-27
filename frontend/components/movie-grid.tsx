import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowRight } from "lucide-react"

// Mock data for movies
const movies = {
  popular: [
    {
      id: 1,
      title: "Interstellar",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 2,
      title: "The Revenant",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 3,
      title: "Die Hard",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 4,
      title: "The Walk",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 5,
      title: "Interstellar",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 6,
      title: "The Revenant",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 7,
      title: "Die Hard",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 8,
      title: "The Walk",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "coming-soon": [
    {
      id: 9,
      title: "Blade Runner",
      rating: 7.3,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 10,
      title: "Mulholland Pride",
      rating: 7.2,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 11,
      title: "Skyfall",
      rating: 7.0,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 12,
      title: "Guardians of the Galaxy",
      rating: 7.4,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "top-rated": [
    {
      id: 13,
      title: "The Godfather",
      rating: 9.2,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 14,
      title: "The Dark Knight",
      rating: 9.0,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 15,
      title: "Pulp Fiction",
      rating: 8.9,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 16,
      title: "Fight Club",
      rating: 8.8,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "most-reviewed": [
    {
      id: 17,
      title: "Inception",
      rating: 8.8,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 18,
      title: "The Matrix",
      rating: 8.7,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 19,
      title: "Goodfellas",
      rating: 8.7,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 20,
      title: "Seven",
      rating: 8.6,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "tv-popular": [
    {
      id: 21,
      title: "Breaking Bad",
      rating: 9.5,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 22,
      title: "Game of Thrones",
      rating: 9.3,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 23,
      title: "Stranger Things",
      rating: 8.7,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 24,
      title: "The Witcher",
      rating: 8.2,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "tv-coming-soon": [
    {
      id: 25,
      title: "House of the Dragon",
      rating: 8.5,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 26,
      title: "The Last of Us",
      rating: 8.8,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 27,
      title: "Loki Season 2",
      rating: 8.2,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 28,
      title: "The Mandalorian",
      rating: 8.7,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "tv-top-rated": [
    {
      id: 29,
      title: "The Wire",
      rating: 9.3,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 30,
      title: "Chernobyl",
      rating: 9.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 31,
      title: "Band of Brothers",
      rating: 9.4,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 32,
      title: "Planet Earth",
      rating: 9.5,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
  "tv-most-reviewed": [
    {
      id: 33,
      title: "Friends",
      rating: 8.9,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 34,
      title: "The Office",
      rating: 8.9,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 35,
      title: "Sherlock",
      rating: 9.1,
      image: "/placeholder.svg?height=284&width=185",
    },
    {
      id: 36,
      title: "True Detective",
      rating: 8.9,
      image: "/placeholder.svg?height=284&width=185",
    },
  ],
}

export default function MovieGrid({ category = "popular" }: { category?: string }) {
  const movieList = movies[category as keyof typeof movies] || movies.popular

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movieList.map((movie) => (
        <Card key={movie.id} className="border-0 overflow-hidden group">
          <CardContent className="p-0 relative">
            <Link href={`/movies/${movie.id}`}>
              <div className="relative">
                <Image
                  src={movie.image || "/placeholder.svg"}
                  alt={movie.title}
                  width={185}
                  height={284}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="text-white text-sm font-medium flex items-center">
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
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
                <span>{movie.rating}</span> /10
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
