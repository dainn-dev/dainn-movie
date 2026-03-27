"use client"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import SocialLinks from "@/components/social-links"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Mock data for slider
const sliderMovies = [
  {
    id: 1,
    title: "Interstellar",
    rating: 7.4,
    image: "/placeholder.svg?height=437&width=285",
    category: "Sci-fi",
  },
  {
    id: 2,
    title: "The Revenant",
    rating: 7.4,
    image: "/placeholder.svg?height=437&width=285",
    category: "Action",
  },
  {
    id: 3,
    title: "Die Hard",
    rating: 7.4,
    image: "/placeholder.svg?height=437&width=285",
    category: "Comedy",
  },
  {
    id: 4,
    title: "The Walk",
    rating: 7.4,
    image: "/placeholder.svg?height=437&width=285",
    category: "Sci-fi, Adventure",
  },
]

export default function MovieSlider() {
  return (
    <div className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <SocialLinks />
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {sliderMovies.map((movie) => (
              <CarouselItem key={movie.id} className="md:basis-1/3 lg:basis-1/4">
                <div className="p-1">
                  <Card className="border-0 bg-transparent text-white">
                    <CardContent className="p-0 relative overflow-hidden group">
                      <Link href={`/movies/${movie.id}`}>
                        <Image
                          src={movie.image || "/placeholder.svg"}
                          alt={movie.title}
                          width={285}
                          height={437}
                          className="w-full h-auto rounded-md transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs rounded bg-blue-600 text-white">
                            {movie.category}
                          </span>
                        </div>
                        <h6 className="text-lg font-medium">
                          <Link href={`/movies/${movie.id}`}>{movie.title}</Link>
                        </h6>
                        <p className="flex items-center text-sm">
                          <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                          <span>{movie.rating}</span> /10
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </div>
  )
}
