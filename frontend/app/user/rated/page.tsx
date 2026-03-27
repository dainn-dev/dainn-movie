import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import UserSidebar from "@/components/user-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for rated movies
const ratedMovies = [
  {
    id: 1,
    title: "Oblivion",
    year: 2012,
    image: "/placeholder.svg?height=284&width=185",
    userRating: 9.0,
    reviewTitle: "Best Marvel movie in my opinion",
    reviewDate: "02 April 2017",
    reviewContent:
      "This is by far one of my favorite movies from the MCU. The introduction of new Characters both good and bad also makes the movie more exciting. giving the characters more of a back story can also help audiences relate more to different characters better, and it connects a bond between the audience and actors or characters. Having seen the movie three times does not bother me here as it is as thrilling and exciting every time I am watching it. In other words, the movie is by far better than previous movies (and I do love everything Marvel), the plotting is splendid (they really do out do themselves in each film, there are no problems watching it more than once.",
  },
  {
    id: 2,
    title: "Into the Wild",
    year: 2014,
    image: "/placeholder.svg?height=284&width=185",
    userRating: 7.0,
  },
  {
    id: 3,
    title: "Blade Runner",
    year: 2015,
    image: "/placeholder.svg?height=284&width=185",
    userRating: 10.0,
    reviewTitle: "A masterpiece!",
    reviewDate: "01 February 2017",
    reviewContent:
      "To put it simply, the movie is fascinating, exciting and fantastic. The dialog, the fight choreography, the way the story moves, the characters charisma, all and much more are combined together to deliver this masterpiece. Such an amazing flow, providing a fusion between the 90s and the new century, it's like the assassins are living in another world, with another mindset, without people understanding it. Just one advice for you though: Don't build an expectation of what you want to watch in this movie, if you do, then you will ruin it. This movie has it's own flow and movement, so watch it with a clear mind, and have fun.",
  },
]

export default function UserRatedMovies() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Edward kennedy's profile</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>Rated movies</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <UserSidebar activeItem="rated" />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p>
                Found <span className="font-medium">3 rates</span> in total
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sort by:</span>
                <Select defaultValue="default">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="-- Choose option --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">-- Choose option --</SelectItem>
                    <SelectItem value="rating-high">Rating (High to Low)</SelectItem>
                    <SelectItem value="rating-low">Rating (Low to High)</SelectItem>
                    <SelectItem value="date-new">Date (Newest First)</SelectItem>
                    <SelectItem value="date-old">Date (Oldest First)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {ratedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-md p-4 md:p-6"
                >
                  <div className="flex-shrink-0">
                    <Link href={`/movies/${movie.id}`}>
                      <Image
                        src={movie.image || "/placeholder.svg"}
                        alt={movie.title}
                        width={185}
                        height={284}
                        className="rounded-md"
                      />
                    </Link>
                  </div>
                  <div className="flex-grow">
                    <h6 className="text-lg font-semibold">
                      <Link href={`/movies/${movie.id}`} className="hover:text-primary">
                        {movie.title} <span className="text-muted-foreground font-normal">({movie.year})</span>
                      </Link>
                    </h6>

                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">Your rate:</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold">{movie.userRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">/10</span>
                      </div>
                    </div>

                    {movie.reviewTitle && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Your review:</p>
                        <h6 className="font-semibold mt-1">{movie.reviewTitle}</h6>
                        <p className="text-xs text-muted-foreground mt-1">{movie.reviewDate}</p>
                        <p className="mt-2 text-sm leading-relaxed">{movie.reviewContent}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm">Movies per page:</span>
                <Select defaultValue="20">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="20 Movies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 Movies</SelectItem>
                    <SelectItem value="10">10 Movies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Page 1 of 1:</span>
                <div className="flex">
                  <Link href="#" className="px-2 py-1 bg-primary text-white rounded">
                    1
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
