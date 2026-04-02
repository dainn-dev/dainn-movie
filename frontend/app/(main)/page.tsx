import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MovieSlider from "@/components/movie-slider"
import MovieGrid from "@/components/movie-grid"
import FeaturedCelebrities from "@/components/featured-celebrities"
import LatestNews from "@/components/latest-news"
import TrailerSection from "@/components/trailer-section"

/** ISR: catalog BE đã cache Redis; giảm TTFB so với force-dynamic (M10-T8). */
export const revalidate = 120

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Slider */}
      <section className="w-full">
        <MovieSlider />
      </section>

      {/* In Theater Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">In Theater</h2>
          <Link href="/movies" className="text-sm flex items-center hover:underline">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <Tabs defaultValue="popular">
          <TabsList className="mb-6">
            <TabsTrigger value="popular">#Popular</TabsTrigger>
            <TabsTrigger value="coming-soon">#Coming soon</TabsTrigger>
            <TabsTrigger value="top-rated">#Top rated</TabsTrigger>
            <TabsTrigger value="most-reviewed">#Most reviewed</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <MovieGrid category="popular" />
          </TabsContent>

          <TabsContent value="coming-soon">
            <MovieGrid category="coming-soon" />
          </TabsContent>

          <TabsContent value="top-rated">
            <MovieGrid category="top-rated" />
          </TabsContent>

          <TabsContent value="most-reviewed">
            <MovieGrid category="most-reviewed" />
          </TabsContent>
        </Tabs>
      </section>

      {/* On TV Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">On TV</h2>
          <Link href="/tv-shows" className="text-sm flex items-center hover:underline">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <Tabs defaultValue="coming-soon">
          <TabsList className="mb-6">
            <TabsTrigger value="popular">#Popular</TabsTrigger>
            <TabsTrigger value="coming-soon">#Coming soon</TabsTrigger>
            <TabsTrigger value="top-rated">#Top rated</TabsTrigger>
            <TabsTrigger value="most-reviewed">#Most reviewed</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <MovieGrid category="tv-popular" />
          </TabsContent>

          <TabsContent value="coming-soon">
            <MovieGrid category="tv-coming-soon" />
          </TabsContent>

          <TabsContent value="top-rated">
            <MovieGrid category="tv-top-rated" />
          </TabsContent>

          <TabsContent value="most-reviewed">
            <MovieGrid category="tv-most-reviewed" />
          </TabsContent>
        </Tabs>
      </section>

      {/* Sidebar Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="mb-8">
              <Image
                src="/placeholder.svg?height=106&width=728"
                alt="Advertisement"
                width={728}
                height={106}
                className="w-full h-auto"
              />
            </div>
            <LatestNews />
          </div>
          <div className="col-span-1">
            <FeaturedCelebrities />
          </div>
        </div>
      </section>

      {/* Trailers Section */}
      <TrailerSection />
    </div>
  )
}
