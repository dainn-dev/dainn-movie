import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"

// Mock data for news
const news = [
  {
    id: 1,
    title: "Brie Larson to play first female white house candidate Victoria Woodull in Amazon film",
    date: "13 hours ago",
    image: "/placeholder.svg?height=250&width=170",
    excerpt:
      "Exclusive: Amazon Studios has acquired Victoria Woodhull, with Oscar winning Room star Brie Larson polsed to produce, and play the first female candidate for the presidency of the United States. Amazon bought it in a pitch package deal. Ben Kopit, who wrote the Warner Bros film Libertine that has...",
  },
  {
    id: 2,
    title: "Magnolia Nabs 'Lucky' Starring Harry Dean Stanton",
    date: "27 Mar 2017",
    image: "/placeholder.svg?height=250&width=170",
    excerpt:
      "Magnolia Pictures has acquired U.S. and international rights to the comedic drama Lucky John Carroll Lynch's directorial debut. Lynch is an in-demand character actor who...",
  },
  {
    id: 3,
    title: "'Going in Style' Tops 'Smurfs: The Lost Village' at Thursday Box Office",
    date: "27 Mar 2017",
    image: "/placeholder.svg?height=250&width=170",
    excerpt:
      'New Line\'s remake of "Going in Style" launched with a moderate $600,000 on Thursday night, while Sony\'s animated "Smurfs: The Lost Village" debuted with $375,000...',
  },
]

// Mock data for more news
const moreNews = [
  {
    id: 4,
    title: 'Michael Shannon Frontrunner to play Cable in "Deadpool 2"',
    date: "13 hours ago",
  },
  {
    id: 5,
    title: 'French cannibal horror "Raw" inspires L.A. theater to hand out "Barf Bags"',
    date: "13 hours ago",
  },
  {
    id: 6,
    title: 'Laura Dern in talks to join Justin Kelly\'s biopic "JT Leroy"',
    date: "13 hours ago",
  },
  {
    id: 7,
    title: "China punishes more than 300 cinemas for box office cheating",
    date: "13 hours ago",
  },
]

export default function LatestNews() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Latest news</h2>

        <Tabs defaultValue="movies">
          <TabsList className="mb-6">
            <TabsTrigger value="movies">#Movies</TabsTrigger>
            <TabsTrigger value="tv-shows">#TV Shows</TabsTrigger>
            <TabsTrigger value="celebs">#Celebs</TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <div className="space-y-6">
              {news.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      width={170}
                      height={250}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-lg font-medium mb-1">
                      <Link href={`/news/${item.id}`} className="hover:text-primary">
                        {item.title}
                      </Link>
                    </h3>
                    <span className="text-sm text-muted-foreground block mb-2">{item.date}</span>
                    <p className="text-sm">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tv-shows">
            <div className="p-8 text-center text-muted-foreground">TV Shows news coming soon</div>
          </TabsContent>

          <TabsContent value="celebs">
            <div className="p-8 text-center text-muted-foreground">Celebrity news coming soon</div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">More news on Blockbuster</h3>
          <Link href="/news" className="text-sm flex items-center hover:text-primary">
            See all Movies news <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {moreNews.slice(0, 2).map((item) => (
              <div key={item.id}>
                <h6 className="text-sm font-medium">
                  <Link href={`/news/${item.id}`} className="hover:text-primary">
                    {item.title}
                  </Link>
                </h6>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {moreNews.slice(2, 4).map((item) => (
              <div key={item.id}>
                <h6 className="text-sm font-medium">
                  <Link href={`/news/${item.id}`} className="hover:text-primary">
                    {item.title}
                  </Link>
                </h6>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
