import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Twitter, Linkedin, Play, ChevronRight } from "lucide-react"

export default async function CelebritySingle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // In a real app, you would fetch celebrity data based on the ID
  const celebrity = {
    id,
    name: "Hugh Jackman",
    role: "Actor | Producer",
    image: "/placeholder.svg?height=500&width=350",
    bio: "Jackman was born in Sydney, New South Wales, to Grace McNeil (Greenwood) and Christopher John Jackman, an accountant. He is the youngest of five children. His parents both English, moved to Australia shortly before his birth. He also has Greek (from a great-grandfather) and Scottish (from a grandmother) ancestry.",
    fullBio:
      "Hugh Michael Jackman is an Australian actor, singer, multi-instrumentalist, dancer and producer. Jackman has won international recognition for his roles in major films, notably as superhero, period, and romance characters.",
    fullName: "Hugh Jackman",
    dateOfBirth: "June 24, 1982",
    country: "Australian",
    height: "186 cm",
    keywords: ["jackman", "wolverine", "logan", "blockbuster", "final battle"],
    filmography: [
      {
        title: "X-Men: Apocalypse",
        role: "Logan",
        year: 2016,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "Eddie the Eagle",
        role: "Bronson Peary",
        year: 2015,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "Me and Earl and the Dying Girl",
        role: "Hugh Jackman",
        year: 2015,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "Night at the Museum 3",
        role: "Blackbeard",
        year: 2014,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "X-Men: Days of Future Past",
        role: "Wolverine",
        year: 2012,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "The Wolverine",
        role: "Logan",
        year: 2011,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "Rise of the Guardians",
        role: "Bunny",
        year: 2011,
        image: "/placeholder.svg?height=100&width=70",
      },
      {
        title: "The Prestige",
        role: "Robert Angier",
        year: 2010,
        image: "/placeholder.svg?height=100&width=70",
      },
    ],
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="w-full h-[300px] bg-gradient-to-r from-gray-900 to-gray-700 relative">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Celebrity Image */}
          <div className="md:col-span-1">
            <Image
              src={celebrity.image || "/placeholder.svg"}
              alt={celebrity.name}
              width={350}
              height={500}
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>

          {/* Celebrity Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold mb-1">{celebrity.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{celebrity.role}</p>

              <div className="flex gap-2 mb-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="biography">Biography</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="filmography">Filmography</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="mb-4">{celebrity.bio}</p>
                      <p className="mb-4">{celebrity.fullBio}</p>
                      <p className="text-sm text-primary mb-6">
                        <Link href="#biography">
                          See full bio <ChevronRight className="inline h-4 w-4" />
                        </Link>
                      </p>

                      <h4 className="text-lg font-medium mb-3">Videos & Photos</h4>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <Image
                          src="/placeholder.svg?height=100&width=150"
                          alt="Celebrity photo"
                          width={150}
                          height={100}
                          className="rounded"
                        />
                        <Image
                          src="/placeholder.svg?height=100&width=150"
                          alt="Celebrity photo"
                          width={150}
                          height={100}
                          className="rounded"
                        />
                        <div className="relative">
                          <Image
                            src="/placeholder.svg?height=100&width=150"
                            alt="Celebrity video"
                            width={150}
                            height={100}
                            className="rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>

                      <h4 className="text-lg font-medium mb-3">Filmography</h4>
                      <div className="space-y-3 mb-6">
                        {celebrity.filmography.slice(0, 4).map((film, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Image
                              src={film.image || "/placeholder.svg"}
                              alt={film.title}
                              width={70}
                              height={100}
                              className="rounded"
                            />
                            <div>
                              <Link href="#" className="font-medium hover:text-primary">
                                {film.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">{film.role}</p>
                            </div>
                            <p className="ml-auto text-sm text-muted-foreground">... {film.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <div className="space-y-4">
                        <div>
                          <h6 className="text-sm font-medium">Fullname:</h6>
                          <p className="text-sm">
                            <Link href="#" className="hover:text-primary">
                              {celebrity.fullName}
                            </Link>
                          </p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Date of Birth:</h6>
                          <p className="text-sm">{celebrity.dateOfBirth}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Country:</h6>
                          <p className="text-sm">{celebrity.country}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Height:</h6>
                          <p className="text-sm">{celebrity.height}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Keywords:</h6>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {celebrity.keywords.map((keyword, index) => (
                              <Link
                                key={index}
                                href="#"
                                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                              >
                                {keyword}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="biography">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-1">Biography of</h3>
                      <h2 className="text-2xl font-bold mb-4">{celebrity.name}</h2>
                    </div>

                    <div className="space-y-4">
                      <p>{celebrity.bio}</p>
                      <p>{celebrity.fullBio}</p>
                      <p>
                        Hugh Michael Jackman is an Australian actor, singer, multi-instrumentalist, dancer and producer.
                        Jackman has won international recognition for his roles in major films, notably as superhero,
                        period, and romance characters. He is best known for his long-running role as Wolverine in the
                        X-Men film series, as well as for his lead roles in the romantic-comedy fantasy Kate & Leopold
                        (2001), the action-horror film Van Helsing (2004), the drama The Prestige and The Fountain
                        (2006), the epic historical romantic drama Australia (2008), the film version of Les Misérables
                        (2012), and the thriller Prisoners (2013). His work in Les Misérables earned him his first
                        Academy Award nomination for Best Actor and his first Golden Globe Award for Best Actor - Motion
                        Picture Musical or Comedy in 2013. In Broadway theatre, Jackman won a Tony Award for his role in
                        The Boy from Oz. A four-time host of the Tony Awards themselves, he won an Emmy Award for one of
                        these appearances. Jackman also hosted the 81st Academy Awards on 22 February 2009.
                      </p>
                      <p>
                        Jackman was born in Sydney, New South Wales, to Grace McNeil (Greenwood) and Christopher John
                        Jackman, an accountant. He is the youngest of five children. His parents, both English, moved to
                        Australia shortly before his birth. He also has Greek (from a great-grandfather) and Scottish
                        (from a grandmother) ancestry.
                      </p>
                      <p>
                        Jackman has a communications degree with a journalism major from the University of Technology
                        Sydney. After graduating, he pursued drama at the Western Australian Academy of Performing Arts,
                        immediately after which he was offered a starring role in the ABC-TV prison drama Correlli
                        (1995), opposite his future wife Deborra-Lee Furness. Several TV guest roles followed, as an
                        actor and variety compere. An accomplished singer, Jackman has starred as Gaston in the
                        Australian production of &ldquo;Beauty and the Beast.&rdquo; He appeared as Joe Gillis in the
                        Australian production of &ldquo;Sunset Boulevard.&rdquo; In 1998, he was cast as Curly in the
                        Royal National Theatre&apos;s production of Trevor Nunn&apos;s Oklahoma. Jackman has made two feature films, the second of which,
                        Erskineville Kings (1999), garnered him an Australian Film Institute nomination for Best Actor
                        in 1999. Recently, he won the part of Logan/Wolverine in the Bryan Singer- directed comic-book
                        movie X-Men (2000). In his spare time, Jackman plays piano, golf, and guitar, and likes to
                        windsurf.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Media of</h3>
                      <h2 className="text-2xl font-bold mb-6">{celebrity.name}</h2>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">
                        Videos <span className="text-muted-foreground">(8)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(8)].map((_, index) => (
                          <div key={index} className="space-y-2">
                            <div className="relative">
                              <Image
                                src="/placeholder.svg?height=150&width=250"
                                alt="Video thumbnail"
                                width={250}
                                height={150}
                                className="rounded"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div>
                              <h6 className="text-sm font-medium">
                                <Link href="#" className="hover:text-primary">
                                  {index === 0
                                    ? "Interview: Hugh Jackman on Wolverine"
                                    : index === 1
                                      ? "Behind the Scenes: Logan"
                                      : index === 2
                                        ? "Hugh Jackman at Comic-Con"
                                        : "Hugh Jackman Interview #" + (index - 2)}
                                </Link>
                              </h6>
                              <p className="text-xs text-muted-foreground">
                                {index === 0 ? "1:31" : index === 1 ? "1:03" : "3:27"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">
                        Photos <span className="text-muted-foreground">(21)</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {[...Array(15)].map((_, index) => (
                          <Link key={index} href="#" className="block">
                            <Image
                              src="/placeholder.svg?height=100&width=150"
                              alt="Celebrity photo"
                              width={150}
                              height={100}
                              className="rounded hover:opacity-80 transition-opacity"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filmography">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Filmography of</h3>
                      <h2 className="text-2xl font-bold mb-6">{celebrity.name}</h2>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <p>
                        Found <span className="font-medium">14 movies</span> in total
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Filter by:</span>
                        <select className="border rounded p-1 text-sm">
                          <option>Popularity Descending</option>
                          <option>Popularity Ascending</option>
                          <option>Rating Descending</option>
                          <option>Rating Ascending</option>
                          <option>Release date Descending</option>
                          <option>Release date Ascending</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {celebrity.filmography.map((film, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Image
                            src={film.image || "/placeholder.svg"}
                            alt={film.title}
                            width={70}
                            height={100}
                            className="rounded"
                          />
                          <div>
                            <Link href="#" className="font-medium hover:text-primary">
                              {film.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{film.role}</p>
                          </div>
                          <p className="ml-auto text-sm text-muted-foreground">... {film.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
