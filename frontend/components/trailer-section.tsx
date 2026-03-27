"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"
import { ChevronRight } from "lucide-react" // Import ChevronRight

// Mock data for trailers
const trailers = [
  {
    id: 1,
    title: "Wonder Woman",
    duration: "2:30",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
  {
    id: 2,
    title: "Oblivion: Official Teaser Trailer",
    duration: "2:37",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
  {
    id: 3,
    title: "Exclusive Interview: Skull Island",
    duration: "2:44",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
  {
    id: 4,
    title: "Logan: Director James Mangold Interview",
    duration: "2:43",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
  {
    id: 5,
    title: "Beauty and the Beast: Official Teaser Trailer 2",
    duration: "2:32",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
  {
    id: 6,
    title: "Fast & Furious 8",
    duration: "3:11",
    image: "/placeholder.svg?height=200&width=350",
    videoUrl: "https://www.youtube.com/embed/o-0hcF97wy0",
  },
]

export default function TrailerSection() {
  const [activeTrailer, setActiveTrailer] = useState(trailers[0])

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">In Theater</h2>
          <a href="#" className="text-sm flex items-center hover:text-primary">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={activeTrailer.videoUrl}
                className="absolute inset-0 w-full h-full"
                title={activeTrailer.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {trailers.map((trailer) => (
                <Card
                  key={trailer.id}
                  className={`cursor-pointer ${activeTrailer.id === trailer.id ? "border-primary" : ""}`}
                  onClick={() => setActiveTrailer(trailer)}
                >
                  <CardContent className="p-3 flex gap-3">
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image
                        src={trailer.image || "/placeholder.svg"}
                        alt={trailer.title}
                        fill
                        className="object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium line-clamp-2">{trailer.title}</h4>
                      <p className="text-xs text-muted-foreground">{trailer.duration}</p>
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
