"use client"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share, Star, Facebook, Twitter, Youtube, Play, Ticket, ChevronRight, Server } from "lucide-react"
import { WriteReviewDialog } from "@/components/write-review-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MovieSingle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  // In a real app, you would fetch movie data based on the ID
  const movie = {
    id: resolvedParams.id,
    title: "Skyfall: Quantum of Spectre",
    year: 2015,
    rating: 8.1,
    reviews: 56,
    image: "/placeholder.svg?height=500&width=350",
    overview:
      "Tony Stark creates the Ultron Program to protect the world, but when the peacekeeping program becomes hostile, The Avengers go into action to try and defeat a virtually impossible enemy together. Earth's mightiest heroes must come together once again to protect the world from global extinction.",
    director: "Joss Whedon",
    writers: ["Joss Whedon", "Stan Lee"],
    stars: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Scarlett Johansson"],
    genres: ["Action", "Sci-Fi", "Adventure"],
    releaseDate: "May 1, 2015 (U.S.A)",
    runtime: "141 min",
    mpaaRating: "PG-13",
    keywords: ["superhero", "marvel universe", "comic", "blockbuster", "final battle"],
    chapters: [
      {
        id: 1,
        title: "Chapter 1: The Beginning",
        duration: "45 min",
        servers: [
          { id: 1, name: "Server 1", quality: "HD" },
          { id: 2, name: "Server 2", quality: "4K" },
          { id: 3, name: "Server 3", quality: "SD" },
        ],
      },
      {
        id: 2,
        title: "Chapter 2: The Confrontation",
        duration: "52 min",
        servers: [
          { id: 4, name: "Server 1", quality: "HD" },
          { id: 5, name: "Server 2", quality: "4K" },
        ],
      },
      {
        id: 3,
        title: "Chapter 3: The Resolution",
        duration: "44 min",
        servers: [
          { id: 6, name: "Server 1", quality: "HD" },
          { id: 7, name: "Server 3", quality: "SD" },
        ],
      },
    ],
  }

  const [selectedChapter, setSelectedChapter] = useState(movie.chapters[0])
  const [selectedServer, setSelectedServer] = useState(selectedChapter.servers[0])

  const handleChapterChange = (chapterId: number) => {
    const chapter = movie.chapters.find((ch) => ch.id === chapterId) || movie.chapters[0]
    setSelectedChapter(chapter)
    setSelectedServer(chapter.servers[0])
  }

  const handleServerChange = (serverId: number) => {
    const server = selectedChapter.servers.find((s) => s.id === serverId) || selectedChapter.servers[0]
    setSelectedServer(server)
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="w-full h-[300px] bg-gradient-to-r from-gray-900 to-gray-700 relative">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Image
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                width={350}
                height={500}
                className="rounded-lg shadow-lg w-full h-auto"
              />
              <div className="mt-4 flex gap-2">
                <Button className="flex-1">
                  <Play className="mr-2 h-4 w-4" /> Watch Trailer
                </Button>
                <Button variant="outline" className="flex-1">
                  <Ticket className="mr-2 h-4 w-4" /> Buy Ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Movie Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold mb-1">
                {movie.title} <span className="text-muted-foreground">({movie.year})</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Heart className="h-4 w-4" /> Add to Favorite
                </Button>

                <div className="relative group">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Share className="h-4 w-4" /> Share
                  </Button>
                  <div className="absolute left-0 mt-2 hidden group-hover:flex gap-1 bg-white p-1 rounded shadow-lg z-10">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Youtube className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-center mt-1">
                    <p className="font-bold">{movie.rating}/10</p>
                    <p className="text-xs text-muted-foreground">{movie.reviews} Reviews</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1">Rate This Movie:</p>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 8 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chapter Selection */}
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Watch Movie</CardTitle>
                  <CardDescription>Select chapter and server</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Chapter</label>
                      <Select
                        value={selectedChapter.id.toString()}
                        onValueChange={(value) => handleChapterChange(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {movie.chapters.map((chapter) => (
                            <SelectItem key={chapter.id} value={chapter.id.toString()}>
                              {chapter.title} ({chapter.duration})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Server</label>
                      <Select
                        value={selectedServer.id.toString()}
                        onValueChange={(value) => handleServerChange(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select server" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedChapter.servers.map((server) => (
                            <SelectItem key={server.id} value={server.id.toString()}>
                              {server.name} - {server.quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" /> Watch Now: {selectedChapter.title} on {selectedServer.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="chapters">Chapters</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="related">Related Movies</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="mb-6">{movie.overview}</p>

                      <h4 className="text-lg font-medium mb-3">Videos & Photos</h4>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <Image
                          src="/placeholder.svg?height=100&width=150"
                          alt="Movie still"
                          width={150}
                          height={100}
                          className="rounded"
                        />
                        <Image
                          src="/placeholder.svg?height=100&width=150"
                          alt="Movie still"
                          width={150}
                          height={100}
                          className="rounded"
                        />
                        <div className="relative">
                          <Image
                            src="/placeholder.svg?height=100&width=150"
                            alt="Movie still"
                            width={150}
                            height={100}
                            className="rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>

                      <h4 className="text-lg font-medium mb-3">Cast</h4>
                      <div className="space-y-3 mb-6">
                        {movie.stars.map((star, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Image
                              src="/placeholder.svg?height=50&width=50"
                              alt={star}
                              width={50}
                              height={50}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">{star}</p>
                              <p className="text-sm text-muted-foreground">as Character {index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <div className="space-y-4">
                        <div>
                          <h6 className="text-sm font-medium">Director:</h6>
                          <p className="text-sm">
                            <Link href="#" className="hover:text-primary">
                              {movie.director}
                            </Link>
                          </p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Writers:</h6>
                          <p className="text-sm">
                            {movie.writers.map((writer, index) => (
                              <span key={index}>
                                <Link href="#" className="hover:text-primary">
                                  {writer}
                                </Link>
                                {index < movie.writers.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Stars:</h6>
                          <p className="text-sm">
                            {movie.stars.map((star, index) => (
                              <span key={index}>
                                <Link href="#" className="hover:text-primary">
                                  {star}
                                </Link>
                                {index < movie.stars.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Genres:</h6>
                          <p className="text-sm">
                            {movie.genres.map((genre, index) => (
                              <span key={index}>
                                <Link href="#" className="hover:text-primary">
                                  {genre}
                                </Link>
                                {index < movie.genres.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Release Date:</h6>
                          <p className="text-sm">{movie.releaseDate}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Run Time:</h6>
                          <p className="text-sm">{movie.runtime}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">MPAA Rating:</h6>
                          <p className="text-sm">{movie.mpaaRating}</p>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">Plot Keywords:</h6>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {movie.keywords.map((keyword, index) => (
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

                <TabsContent value="chapters">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">All Chapters</h3>

                    {movie.chapters.map((chapter) => (
                      <div key={chapter.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-medium">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground">Duration: {chapter.duration}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {chapter.servers.map((server) => (
                              <Button
                                key={server.id}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedChapter(chapter)
                                  setSelectedServer(server)
                                }}
                                className={
                                  selectedChapter.id === chapter.id && selectedServer.id === server.id
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : ""
                                }
                              >
                                <Server className="mr-1 h-4 w-4" /> {server.name} ({server.quality})
                              </Button>
                            ))}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedChapter(chapter)
                                setSelectedServer(chapter.servers[0])
                              }}
                            >
                              <Play className="mr-1 h-4 w-4" /> Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Related Movies To</h3>
                        <h2 className="text-2xl font-bold">Skyfall: Quantum of Spectre</h2>
                      </div>
                      <WriteReviewDialog movieTitle={movie.title} movieId={movie.id} />
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <p>
                        Found <span className="font-medium">56 reviews</span> in total
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

                    {/* Review Item */}
                    <div className="border-b pb-6">
                      <div className="flex gap-4">
                        <Image
                          src="/placeholder.svg?height=60&width=60"
                          alt="User"
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-bold">Best Marvel movie in my opinion</h3>
                          <div className="flex mb-1">
                            {[...Array(10)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < 9 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            17 December 2016 by{" "}
                            <Link href="#" className="text-primary">
                              hawaiipierson
                            </Link>
                          </p>
                          <p className="text-sm">
                            This is by far one of my favorite movies from the MCU. The introduction of new Characters
                            both good and bad also makes the movie more exciting. giving the characters more of a back
                            story can also help audiences relate more to different characters better, and it connects a
                            bond between the audience and actors or characters. Having seen the movie three times does
                            not bother me here as it is as thrilling and exciting every time I am watching it. In other
                            words, the movie is by far better than previous movies (and I do love everything Marvel),
                            the plotting is splendid (they really do out do themselves in each film, there are no
                            problems watching it more than once.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* More reviews would go here */}

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Reviews per page:</span>
                        <select className="border rounded p-1 text-sm">
                          <option>5 Reviews</option>
                          <option>10 Reviews</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Page 1 of 6:</span>
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
                            4
                          </Link>
                          <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                            5
                          </Link>
                          <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                            6
                          </Link>
                          <Link href="#" className="px-2 py-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cast">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-4">Cast & Crew of</h3>
                    <h2 className="text-2xl font-bold mb-6">Skyfall: Quantum of Spectre</h2>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Directors</h4>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md text-lg font-bold">
                          JW
                        </div>
                        <div>
                          <Link href="#" className="font-medium hover:text-primary">
                            Joss Whedon
                          </Link>
                          <p className="text-sm text-muted-foreground">Director</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Writers</h4>
                      <div className="space-y-3 mb-4">
                        {movie.writers.map((writer, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md text-lg font-bold">
                              {writer
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </div>
                            <div>
                              <Link href="#" className="font-medium hover:text-primary">
                                {writer}
                              </Link>
                              <p className="text-sm text-muted-foreground">Writer</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-3">Cast</h4>
                      <div className="space-y-3 mb-4">
                        {movie.stars.map((star, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Image
                              src="/placeholder.svg?height=50&width=50"
                              alt={star}
                              width={50}
                              height={50}
                              className="rounded-full"
                            />
                            <div>
                              <Link href="#" className="font-medium hover:text-primary">
                                {star}
                              </Link>
                              <p className="text-sm text-muted-foreground">as Character {index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Videos & Photos of</h3>
                      <h2 className="text-2xl font-bold mb-6">Skyfall: Quantum of Spectre</h2>
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
                                    ? "Trailer: Watch New Scenes"
                                    : index === 1
                                      ? "Featurette: Avengers Re-Assembled"
                                      : index === 2
                                        ? "Interview: Robert Downey Jr"
                                        : "Official Trailer #" + (index - 2)}
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
                              alt="Movie still"
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

                <TabsContent value="related">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-1">Related Movies To</h3>
                    <h2 className="text-2xl font-bold mb-6">Skyfall: Quantum of Spectre</h2>

                    <div className="flex justify-between items-center mb-4">
                      <p>
                        Found <span className="font-medium">12 movies</span> in total
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Sort by:</span>
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

                    <div className="space-y-6">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 pb-6 border-b">
                          <div className="sm:w-1/4">
                            <Image
                              src="/placeholder.svg?height=200&width=150"
                              alt="Movie poster"
                              width={150}
                              height={200}
                              className="w-full h-auto rounded"
                            />
                          </div>
                          <div className="sm:w-3/4">
                            <h6 className="text-lg font-medium">
                              <Link href="#" className="hover:text-primary">
                                {index === 0
                                  ? "Oblivion"
                                  : index === 1
                                    ? "Into the Wild"
                                    : index === 2
                                      ? "Blade Runner"
                                      : index === 3
                                        ? "Mulholland Pride"
                                        : "Skyfall: Evil of Boss"}
                                <span className="text-muted-foreground ml-1">({2010 + index})</span>
                              </Link>
                            </h6>
                            <p className="flex items-center text-sm mb-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="font-medium">8.1</span> /10
                            </p>
                            <p className="text-sm mb-2">
                              Earth's mightiest heroes must come together and learn to fight as a team if they are to
                              stop the mischievous Loki and his alien army from enslaving humanity...
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Run Time: 2h21' • MPAA: PG-13 • Release: 1 May 2015
                            </p>
                            <p className="text-sm">
                              Director:{" "}
                              <Link href="#" className="hover:text-primary">
                                Joss Whedon
                              </Link>
                            </p>
                            <p className="text-sm">
                              Stars:
                              <Link href="#" className="hover:text-primary ml-1">
                                Robert Downey Jr.,
                              </Link>
                              <Link href="#" className="hover:text-primary ml-1">
                                Chris Evans,
                              </Link>
                              <Link href="#" className="hover:text-primary ml-1">
                                Chris Hemsworth
                              </Link>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Movies per page:</span>
                        <select className="border rounded p-1 text-sm">
                          <option>5 Movies</option>
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
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
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