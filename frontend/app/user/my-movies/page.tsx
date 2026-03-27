"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Edit, Trash, MoreHorizontal, Upload, Film, BarChart } from "lucide-react"
import UserSidebar from "@/components/user-sidebar"

// Mock data for user uploaded movies
const userMovies = [
  {
    id: 1,
    title: "Summer Adventure",
    category: "Short Film",
    genre: "Adventure",
    duration: "15 min",
    uploadDate: "2025-01-15",
    status: "approved",
    views: 1245,
    likes: 87,
    comments: 32,
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    title: "City Lights",
    category: "Documentary",
    genre: "Urban",
    duration: "22 min",
    uploadDate: "2025-01-10",
    status: "pending",
    views: 0,
    likes: 0,
    comments: 0,
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 3,
    title: "The Last Journey",
    category: "Feature Film",
    genre: "Drama",
    duration: "1h 45min",
    uploadDate: "2024-12-28",
    status: "approved",
    views: 3567,
    likes: 245,
    comments: 78,
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 4,
    title: "Midnight Mystery",
    category: "Short Film",
    genre: "Thriller",
    duration: "18 min",
    uploadDate: "2024-12-15",
    status: "rejected",
    views: 0,
    likes: 0,
    comments: 0,
    thumbnail: "/placeholder.svg?height=120&width=200",
    rejectionReason: "Content violates community guidelines regarding excessive violence.",
  },
  {
    id: 5,
    title: "Nature's Wonders",
    category: "Documentary",
    genre: "Nature",
    duration: "35 min",
    uploadDate: "2024-11-30",
    status: "approved",
    views: 2189,
    likes: 156,
    comments: 42,
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

// Mock data for analytics
const analyticsData = {
  totalViews: 7001,
  totalLikes: 488,
  totalComments: 152,
  topPerforming: "The Last Journey",
  recentGrowth: "+15% views this month",
}

export default function UserMoviesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null)

  const filteredMovies = activeTab === "all" ? userMovies : userMovies.filter((movie) => movie.status === activeTab)

  const handleDeleteMovie = () => {
    // In a real app, you would send a request to your API
    console.log(`Deleting movie with ID: ${selectedMovie}`)
    setDeleteDialogOpen(false)
    setSelectedMovie(null)
  }

  const handleUploadMovie = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the form data to your API
    console.log("Uploading new movie")
    setUploadDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Movies</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>My Movies</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <UserSidebar activeItem="profile" />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Movies</h2>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" /> Upload Movie
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Upload New Movie</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to upload your movie. All uploads are subject to review.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadMovie}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Movie Title</Label>
                            <Input id="title" placeholder="Enter movie title" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select defaultValue="short">
                              <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short">Short Film</SelectItem>
                                <SelectItem value="feature">Feature Film</SelectItem>
                                <SelectItem value="documentary">Documentary</SelectItem>
                                <SelectItem value="animation">Animation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="genre">Genre</Label>
                            <Select defaultValue="drama">
                              <SelectTrigger id="genre">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="drama">Drama</SelectItem>
                                <SelectItem value="comedy">Comedy</SelectItem>
                                <SelectItem value="action">Action</SelectItem>
                                <SelectItem value="thriller">Thriller</SelectItem>
                                <SelectItem value="horror">Horror</SelectItem>
                                <SelectItem value="scifi">Sci-Fi</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" placeholder="e.g. 15 min, 1h 30min" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Provide a brief description of your movie"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thumbnail">Thumbnail</Label>
                          <Input id="thumbnail" type="file" accept="image/*" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="movie-file">Movie File</Label>
                          <Input id="movie-file" type="file" accept="video/*" required />
                          <p className="text-xs text-muted-foreground">
                            Maximum file size: 2GB. Supported formats: MP4, MOV, AVI.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Upload</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                  <p className="text-2xl font-bold">{analyticsData.totalViews}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Likes</p>
                  <p className="text-2xl font-bold">{analyticsData.totalLikes}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Comments</p>
                  <p className="text-2xl font-bold">{analyticsData.totalComments}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-1">Growth</p>
                  <p className="text-2xl font-bold text-green-500">{analyticsData.recentGrowth}</p>
                </div>
              </div>

              {/* Movies Tabs */}
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Movies</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Movie</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMovies.length > 0 ? (
                          filteredMovies.map((movie) => (
                            <TableRow key={movie.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={movie.thumbnail || "/placeholder.svg"}
                                    alt={movie.title}
                                    width={80}
                                    height={45}
                                    className="rounded"
                                  />
                                  <div>
                                    <p className="font-medium">{movie.title}</p>
                                    <p className="text-xs text-muted-foreground">{movie.genre}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{movie.category}</TableCell>
                              <TableCell>{movie.duration}</TableCell>
                              <TableCell>{new Date(movie.uploadDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(movie.status)}</TableCell>
                              <TableCell>{movie.views}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {movie.status === "approved" && (
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" /> View
                                      </DropdownMenuItem>
                                    )}
                                    {movie.status !== "rejected" && (
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                      <BarChart className="h-4 w-4 mr-2" /> Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedMovie(movie.id)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center">
                                <Film className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No movies found</p>
                                {activeTab !== "all" && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    You don't have any {activeTab} movies.
                                  </p>
                                )}
                                <Button variant="outline" className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                                  Upload Your First Movie
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Rejection Details */}
              {activeTab === "rejected" && filteredMovies.some((movie) => movie.status === "rejected") && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">Rejection Details</h3>
                  <div className="space-y-4">
                    {filteredMovies
                      .filter((movie) => movie.status === "rejected")
                      .map((movie) => (
                        <div key={`rejection-${movie.id}`} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium mb-2">{movie.title}</h4>
                          <p className="text-sm text-red-600">{movie.rejectionReason}</p>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline">
                              Appeal Decision
                            </Button>
                            <Button size="sm">Upload Revised Version</Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this movie? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMovie}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
