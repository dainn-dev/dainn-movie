import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowRight, ChevronRight } from "lucide-react"
import UserSidebar from "@/components/user-sidebar"

// Mock data for favorite movies
const favoriteMovies = [
  {
    id: 1,
    title: "Oblivion",
    rating: 8.1,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 2,
    title: "Into the Wild",
    rating: 7.8,
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
    title: "Blade Runner",
    rating: 7.3,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 6,
    title: "Mulholland Pride",
    rating: 7.2,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 7,
    title: "Skyfall",
    rating: 7.0,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 8,
    title: "Interstellar",
    rating: 7.4,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 9,
    title: "The Revenant",
    rating: 7.4,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 10,
    title: "Harry Potter",
    rating: 7.4,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 11,
    title: "Guardians of the Galaxy",
    rating: 7.4,
    image: "/placeholder.svg?height=284&width=185",
  },
  {
    id: 12,
    title: "The Godfather",
    rating: 7.4,
    image: "/placeholder.svg?height=284&width=185",
  },
]

// Define the ListIcon and GridIcon components
const ListIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
)

const GridIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

export default function UserFavoritesGrid() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Edward kennedy&apos;s profile</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>Favorite movies</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <UserSidebar activeItem="favorites" />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p>
                Found <span className="font-medium">1,608 movies</span> in total
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Sort by:</span>
                  <select className="border rounded p-1 text-sm">
                    <option>-- Choose option --</option>
                    <option>-- Choose option 2--</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/user/favorites/list" className="p-1 hover:text-primary">
                    <ListIcon className="h-5 w-5" />
                  </Link>
                  <Link href="/user/favorites/grid" className="p-1 text-primary">
                    <GridIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoriteMovies.map((movie) => (
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

            <div className="flex justify-between items-center mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm">Movies per page:</span>
                <select className="border rounded p-1 text-sm">
                  <option>20 Movies</option>
                  <option>10 Movies</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Page 1 of 2:</span>
                <div className="flex">
                  <Link href="#" className="px-2 py-1 bg-primary text-white rounded">
                    1
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    2
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    3
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    ...
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    78
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    79
                  </Link>
                  <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
