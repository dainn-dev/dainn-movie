import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

// Mock data for celebrities
const celebrities = [
  {
    id: 1,
    name: "Samuel N. Jack",
    role: "Actor",
    image: "/placeholder.svg?height=70&width=70",
  },
  {
    id: 2,
    name: "Benjamin Carroll",
    role: "Actor",
    image: "/placeholder.svg?height=70&width=70",
  },
  {
    id: 3,
    name: "Beverly Griffin",
    role: "Actor",
    image: "/placeholder.svg?height=70&width=70",
  },
  {
    id: 4,
    name: "Justin Weaver",
    role: "Actor",
    image: "/placeholder.svg?height=70&width=70",
  },
]

export default function FeaturedCelebrities() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="text-lg font-bold mb-4">Spotlight Celebrities</h4>
      <div className="space-y-4">
        {celebrities.map((celebrity) => (
          <div key={celebrity.id} className="flex items-center space-x-3">
            <Link href={`/celebrities/${celebrity.id}`}>
              <Image
                src={celebrity.image || "/placeholder.svg"}
                alt={celebrity.name}
                width={70}
                height={70}
                className="rounded-full"
              />
            </Link>
            <div>
              <h6 className="font-medium">
                <Link href={`/celebrities/${celebrity.id}`} className="hover:text-primary">
                  {celebrity.name}
                </Link>
              </h6>
              <span className="text-sm text-muted-foreground">{celebrity.role}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button variant="outline" className="w-full flex items-center justify-center">
          See all celebrities <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
