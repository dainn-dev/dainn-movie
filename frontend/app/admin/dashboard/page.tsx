"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Eye,
  Edit,
  Trash,
  MoreHorizontal,
  Check,
  X,
  FileText,
  User,
  Search,
  Plus,
  Filter,
  Film,
  Server,
  Layers,
  LinkIcon,
  Upload,
  ImageIcon,
} from "lucide-react"
import AdminSidebar from "@/components/admin-sidebar"
import { AdminLiveStats } from "@/components/admin-live-stats"
import { AdminModerationSection } from "@/components/admin-moderation-section"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock data for all movies
const allMovies = [
  {
    id: 1,
    title: "Interstellar",
    category: "Feature Film",
    genre: "Sci-Fi",
    year: 2014,
    status: "published",
    views: 12456,
    thumbnail: "/placeholder.svg?height=120&width=200",
    chapters: [
      { id: 1, title: "Chapter 1", duration: "45 min" },
      { id: 2, title: "Chapter 2", duration: "52 min" },
    ],
  },
  {
    id: 2,
    title: "The Dark Knight",
    category: "Feature Film",
    genre: "Action",
    year: 2008,
    status: "published",
    views: 18932,
    thumbnail: "/placeholder.svg?height=120&width=200",
    chapters: [
      { id: 3, title: "Chapter 1", duration: "55 min" },
      { id: 4, title: "Chapter 2", duration: "48 min" },
      { id: 5, title: "Chapter 3", duration: "50 min" },
    ],
  },
  {
    id: 3,
    title: "City Lights",
    category: "Documentary",
    genre: "Urban",
    year: 2025,
    status: "pending",
    views: 0,
    thumbnail: "/placeholder.svg?height=120&width=200",
    chapters: [],
  },
  {
    id: 4,
    title: "Inception",
    category: "Feature Film",
    genre: "Sci-Fi",
    year: 2010,
    status: "published",
    views: 15678,
    thumbnail: "/placeholder.svg?height=120&width=200",
    chapters: [
      { id: 6, title: "Chapter 1", duration: "60 min" },
      { id: 7, title: "Chapter 2", duration: "65 min" },
    ],
  },
  {
    id: 5,
    title: "The Last Stand",
    category: "Feature Film",
    genre: "Action",
    year: 2025,
    status: "pending",
    views: 0,
    thumbnail: "/placeholder.svg?height=120&width=200",
    chapters: [],
  },
]

// Mock data for all chapters
const allChapters = [
  { id: 1, movieId: 1, title: "Chapter 1", duration: "45 min", order: 1 },
  { id: 2, movieId: 1, title: "Chapter 2", duration: "52 min", order: 2 },
  { id: 3, movieId: 2, title: "Chapter 1", duration: "55 min", order: 1 },
  { id: 4, movieId: 2, title: "Chapter 2", duration: "48 min", order: 2 },
  { id: 5, movieId: 2, title: "Chapter 3", duration: "50 min", order: 3 },
  { id: 6, movieId: 4, title: "Chapter 1", duration: "60 min", order: 1 },
  { id: 7, movieId: 4, title: "Chapter 2", duration: "65 min", order: 2 },
]

// Mock data for all servers
const allServers = [
  { id: 1, name: "Server 1", quality: "HD", url: "https://example.com/server1" },
  { id: 2, name: "Server 2", quality: "4K", url: "https://example.com/server2" },
  { id: 3, name: "Server 3", quality: "SD", url: "https://example.com/server3" },
  { id: 4, name: "Server 4", quality: "HD", url: "https://example.com/server4" },
  { id: 5, name: "Server 5", quality: "4K", url: "https://example.com/server5" },
]

// Mock data for chapter-server assignments
const chapterServerAssignments = [
  { id: 1, chapterId: 1, serverId: 1 },
  { id: 2, chapterId: 1, serverId: 2 },
  { id: 3, chapterId: 1, serverId: 3 },
  { id: 4, chapterId: 2, serverId: 1 },
  { id: 5, chapterId: 2, serverId: 2 },
  { id: 6, chapterId: 3, serverId: 1 },
  { id: 7, chapterId: 3, serverId: 3 },
  { id: 8, chapterId: 4, serverId: 2 },
  { id: 9, chapterId: 5, serverId: 1 },
  { id: 10, chapterId: 6, serverId: 1 },
  { id: 11, chapterId: 6, serverId: 2 },
  { id: 12, chapterId: 7, serverId: 3 },
]

// Mock data for all users
const allUsers = [
  {
    id: 1,
    name: "Edward Kennedy",
    username: "edward_kennedy",
    email: "edward@example.com",
    joinDate: "2024-10-15",
    status: "active",
    uploads: 5,
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin",
  },
  {
    id: 2,
    name: "Jessica Williams",
    username: "jess_w",
    email: "jessica@example.com",
    joinDate: "2024-11-20",
    status: "active",
    uploads: 2,
    avatar: "/placeholder.svg?height=40&width=40",
    role: "editor",
  },
  {
    id: 3,
    name: "Michael Chen",
    username: "mike_c",
    email: "michael@example.com",
    joinDate: "2025-01-15",
    status: "active",
    uploads: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    username: "sarah_j",
    email: "sarah@example.com",
    joinDate: "2025-01-14",
    status: "active",
    uploads: 1,
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
  {
    id: 5,
    name: "David Wilson",
    username: "dave_w",
    email: "david@example.com",
    joinDate: "2025-01-12",
    status: "suspended",
    uploads: 3,
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
  },
]

// Mock data for all news articles
const allNews = [
  {
    id: 1,
    title: "New Character Posters For Pirates Of The Caribbean",
    author: "Admin",
    category: "Movies",
    publishDate: "2025-01-15",
    status: "published",
    views: 1245,
    thumbnail: "/placeholder.svg?height=120&width=200",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    tags: ["pirates", "caribbean", "posters"],
  },
  {
    id: 2,
    title: "Exclusive Interview: Skull Island",
    author: "Jessica Williams",
    category: "Interviews",
    publishDate: "2025-01-10",
    status: "published",
    views: 876,
    thumbnail: "/placeholder.svg?height=120&width=200",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    tags: ["skull island", "interview", "exclusive"],
  },
  {
    id: 3,
    title: "Beauty and the Beast: Official Teaser Trailer 2",
    author: "Admin",
    category: "Trailers",
    publishDate: "2025-01-05",
    status: "published",
    views: 2345,
    thumbnail: "/placeholder.svg?height=120&width=200",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    tags: ["beauty", "beast", "trailer"],
  },
  {
    id: 4,
    title: "Fast & Furious 8 Behind the Scenes",
    author: "Michael Chen",
    category: "Movies",
    publishDate: "2024-12-28",
    status: "draft",
    views: 0,
    thumbnail: "/placeholder.svg?height=120&width=200",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    tags: ["fast", "furious", "behind the scenes"],
  },
]

// Mock data for all celebrities
const allCelebrities = [
  {
    id: 1,
    name: "Hugh Jackman",
    role: "Actor",
    movies: 15,
    status: "active",
    avatar: "/placeholder.svg?height=70&width=70",
    bio: "Hugh Michael Jackman is an Australian actor. Beginning in theatre and television, he landed his breakthrough role as Wolverine in the X-Men film series.",
    birthDate: "1968-10-12",
    birthPlace: "Sydney, Australia",
    height: "6' 2\" (1.88 m)",
    socialMedia: {
      twitter: "@RealHughJackman",
      instagram: "@thehughjackman",
    },
  },
  {
    id: 2,
    name: "Scarlett Johansson",
    role: "Actress",
    movies: 12,
    status: "active",
    avatar: "/placeholder.svg?height=70&width=70",
    bio: "Scarlett Johansson is an American actress and singer. She was the world's highest-paid actress in 2018 and 2019, and has featured multiple times on the Forbes Celebrity 100 list.",
    birthDate: "1984-11-22",
    birthPlace: "New York City, USA",
    height: "5' 3\" (1.60 m)",
    socialMedia: {
      twitter: "@scarlett_jo",
      instagram: "@scarlettjohanssonofficial",
    },
  },
  {
    id: 3,
    name: "Christopher Nolan",
    role: "Director",
    movies: 8,
    status: "active",
    avatar: "/placeholder.svg?height=70&width=70",
    bio: "Christopher Edward Nolan is a British-American film director, producer, and screenwriter. His films have grossed more than US$5 billion worldwide.",
    birthDate: "1970-07-30",
    birthPlace: "London, England",
    height: "5' 11\" (1.80 m)",
    socialMedia: {
      twitter: "",
      instagram: "",
    },
  },
  {
    id: 4,
    name: "Samuel N. Jack",
    role: "Actor",
    movies: 20,
    status: "active",
    avatar: "/placeholder.svg?height=70&width=70",
    bio: "Samuel Leroy Jackson is an American actor and producer. Widely regarded as one of the most popular actors of his generation, the films in which he has appeared have collectively grossed over $27 billion worldwide.",
    birthDate: "1948-12-21",
    birthPlace: "Washington, D.C., USA",
    height: "6' 2\" (1.89 m)",
    socialMedia: {
      twitter: "@SamuelLJackson",
      instagram: "@samuelljackson",
    },
  },
  {
    id: 5,
    name: "Benjamin Carroll",
    role: "Actor",
    movies: 6,
    status: "inactive",
    avatar: "/placeholder.svg?height=70&width=70",
    bio: "Benjamin Carroll is an up-and-coming actor known for his versatile performances in independent films.",
    birthDate: "1992-05-15",
    birthPlace: "Chicago, USA",
    height: "5' 10\" (1.78 m)",
    socialMedia: {
      twitter: "@bencarroll",
      instagram: "@benjamincarroll",
    },
  },
]

// Movie categories and genres for dropdowns
const movieCategories = ["Feature Film", "Documentary", "Short Film", "Animation", "TV Series"]
const movieGenres = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
]

// News categories for dropdowns
const newsCategories = ["Movies", "Interviews", "Trailers", "Reviews", "Industry News", "Events", "Awards"]

// Celebrity roles for dropdowns
const celebrityRoles = ["Actor", "Actress", "Director", "Producer", "Writer", "Cinematographer", "Composer"]

// User roles for dropdowns
const userRoles = ["user", "editor", "admin"]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Chapter management
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [chapterFormData, setChapterFormData] = useState({
    title: "",
    duration: "",
    order: 1,
  })

  // Server management
  const [serverDialogOpen, setServerDialogOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<number | null>(null)
  const [serverFormData, setServerFormData] = useState({
    name: "",
    quality: "HD",
    url: "",
  })

  // Chapter-Server assignment
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [assignmentFormData, setAssignmentFormData] = useState({
    chapterId: "",
    serverId: "",
  })

  // Add state to track sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // New state for Apply as Chapter functionality
  const [applyAsChapter, setApplyAsChapter] = useState(false)
  const [applyAsChapterDialogOpen, setApplyAsChapterDialogOpen] = useState(false)
  const [existingChapterCheck, setExistingChapterCheck] = useState<{
    exists: boolean
    chapterId?: number
    movieTitle?: string
  }>({ exists: false })

  // New state for Create Movie functionality
  const [createMovieDialogOpen, setCreateMovieDialogOpen] = useState(false)
  const [createMovieFormData, setCreateMovieFormData] = useState({
    title: "",
    category: "",
    genre: "",
    year: new Date().getFullYear(),
    description: "",
    thumbnail: "",
    status: "published",
  })
  const [includeChapter, setIncludeChapter] = useState(true)
  const [createMovieChapters, setCreateMovieChapters] = useState([
    {
      id: 1,
      title: "Chapter 1",
      duration: "45 min",
      order: 1,
      server: {
        name: "Server 1",
        quality: "HD",
        url: "",
      },
    },
  ])

  // New state for Create User functionality
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [createUserFormData, setCreateUserFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
    avatar: "",
  })

  // New state for Create Article functionality
  const [createArticleDialogOpen, setCreateArticleDialogOpen] = useState(false)
  const [createArticleFormData, setCreateArticleFormData] = useState({
    title: "",
    author: "",
    category: "",
    content: "",
    thumbnail: "",
    status: "draft",
    tags: "",
  })

  // New state for Create Celebrity functionality
  const [createCelebrityDialogOpen, setCreateCelebrityDialogOpen] = useState(false)
  const [createCelebrityFormData, setCreateCelebrityFormData] = useState({
    name: "",
    role: "",
    bio: "",
    birthDate: "",
    birthPlace: "",
    height: "",
    status: "active",
    avatar: "",
    twitter: "",
    instagram: "",
  })

  // Filter states
  const [movieFilterOpen, setMovieFilterOpen] = useState(false)
  const [movieFilters, setMovieFilters] = useState({
    category: "all",
    genre: "all",
    status: "all",
    year: "all",
  })

  const [userFilterOpen, setUserFilterOpen] = useState(false)
  const [userFilters, setUserFilters] = useState({
    status: "all",
    role: "all",
    joinDate: "all",
  })

  const [newsFilterOpen, setNewsFilterOpen] = useState(false)
  const [newsFilters, setNewsFilters] = useState({
    category: "all",
    status: "all",
    author: "all",
  })

  const [celebrityFilterOpen, setCelebrityFilterOpen] = useState(false)
  const [celebrityFilters, setCelebrityFilters] = useState({
    role: "all",
    status: "all",
  })

  const handleApproveMovie = () => {
    // In a real app, you would send a request to your API
    console.log(`Approving movie with ID: ${selectedItem}`)

    if (applyAsChapter) {
      setApplyAsChapterDialogOpen(true)
    } else {
      setApproveDialogOpen(false)
      setSelectedItem(null)
    }
  }

  const handleApplyAsChapter = () => {
    // In a real app, you would send a request to your API to create a chapter or server
    if (existingChapterCheck.exists && existingChapterCheck.chapterId) {
      console.log(`Creating server for existing chapter ID: ${existingChapterCheck.chapterId}`, serverFormData)
      // Here you would create a server for the existing chapter
    } else {
      console.log(`Creating new chapter for movie ID: ${selectedMovie}`, chapterFormData)
      console.log(`And creating server for the new chapter`, serverFormData)
      // Here you would create a new chapter and a server for it
    }

    setApplyAsChapterDialogOpen(false)
    setApproveDialogOpen(false)
    setSelectedItem(null)
    setApplyAsChapter(false)
    setExistingChapterCheck({ exists: false })

    // Reset form data
    setChapterFormData({
      title: "",
      duration: "",
      order: 1,
    })
    setServerFormData({
      name: "",
      quality: "HD",
      url: "",
    })
  }

  const handleRejectMovie = () => {
    // In a real app, you would send a request to your API
    console.log(`Rejecting movie with ID: ${selectedItem}`)
    setRejectDialogOpen(false)
    setSelectedItem(null)
  }

  const handleDeleteItem = () => {
    // In a real app, you would send a request to your API
    console.log(`Deleting item with ID: ${selectedItem} from ${activeTab}`)
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const handleSaveChapter = () => {
    // In a real app, you would send a request to your API
    console.log(`Saving chapter for movie ID: ${selectedMovie}`, chapterFormData)
    setChapterDialogOpen(false)
    setSelectedMovie(null)
    setSelectedChapter(null)
    setChapterFormData({
      title: "",
      duration: "",
      order: 1,
    })
  }

  const handleSaveServer = () => {
    // In a real app, you would send a request to your API
    console.log(`Saving server`, serverFormData)
    setServerDialogOpen(false)
    setSelectedServer(null)
    setServerFormData({
      name: "",
      quality: "HD",
      url: "",
    })
  }

  const handleSaveAssignment = () => {
    // In a real app, you would send a request to your API
    console.log(`Saving chapter-server assignment`, assignmentFormData)
    setAssignmentDialogOpen(false)
    setAssignmentFormData({
      chapterId: "",
      serverId: "",
    })
  }

  const handleCreateMovie = () => {
    // In a real app, you would send a request to your API
    console.log("Creating new movie:", createMovieFormData)

    if (includeChapter) {
      console.log("With chapters:", createMovieChapters)
    }

    // Reset form data
    setCreateMovieFormData({
      title: "",
      category: "",
      genre: "",
      year: new Date().getFullYear(),
      description: "",
      thumbnail: "",
      status: "published",
    })
    setCreateMovieChapters([
      {
        id: 1,
        title: "Chapter 1",
        duration: "45 min",
        order: 1,
        server: {
          name: "Server 1",
          quality: "HD",
          url: "",
        },
      },
    ])
    setIncludeChapter(true)
    setCreateMovieDialogOpen(false)
  }

  const handleCreateUser = () => {
    // In a real app, you would send a request to your API
    console.log("Creating new user:", createUserFormData)

    // Reset form data
    setCreateUserFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      status: "active",
      avatar: "",
    })
    setCreateUserDialogOpen(false)
  }

  const handleCreateArticle = () => {
    // In a real app, you would send a request to your API
    console.log("Creating new article:", createArticleFormData)

    // Reset form data
    setCreateArticleFormData({
      title: "",
      author: "",
      category: "",
      content: "",
      thumbnail: "",
      status: "draft",
      tags: "",
    })
    setCreateArticleDialogOpen(false)
  }

  const handleCreateCelebrity = () => {
    // In a real app, you would send a request to your API
    console.log("Creating new celebrity:", createCelebrityFormData)

    // Reset form data
    setCreateCelebrityFormData({
      name: "",
      role: "",
      bio: "",
      birthDate: "",
      birthPlace: "",
      height: "",
      status: "active",
      avatar: "",
      twitter: "",
      instagram: "",
    })
    setCreateCelebrityDialogOpen(false)
  }

  const addChapter = () => {
    setCreateMovieChapters([
      ...createMovieChapters,
      {
        id: createMovieChapters.length + 1,
        title: `Chapter ${createMovieChapters.length + 1}`,
        duration: "45 min",
        order: createMovieChapters.length + 1,
        server: {
          name: `Server ${createMovieChapters.length + 1}`,
          quality: "HD",
          url: "",
        },
      },
    ])
  }

  const removeChapter = (index: number) => {
    const updatedChapters = createMovieChapters.filter((_, i) => i !== index)
    // Update order numbers to be sequential
    const reorderedChapters = updatedChapters.map((chapter, i) => ({
      ...chapter,
      order: i + 1,
      title: chapter.title.startsWith("Chapter ") ? `Chapter ${i + 1}` : chapter.title,
    }))
    setCreateMovieChapters(reorderedChapters)
  }

  const updateChapter = (index: number, field: string, value: string | number) => {
    const updatedChapters = [...createMovieChapters]
    updatedChapters[index] = {
      ...updatedChapters[index],
      [field]: value,
    }
    setCreateMovieChapters(updatedChapters)
  }

  const updateChapterServer = (index: number, field: string, value: string) => {
    const updatedChapters = [...createMovieChapters]
    updatedChapters[index] = {
      ...updatedChapters[index],
      server: {
        ...updatedChapters[index].server,
        [field]: value,
      },
    }
    setCreateMovieChapters(updatedChapters)
  }

  // Add handler for sidebar collapse state changes
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  // Check if a chapter already exists for the selected movie
  const checkExistingChapter = (movieId: number, chapterTitle: string) => {
    const movie = getMovieById(movieId)
    if (!movie) return { exists: false }

    const chapters = getChaptersByMovieId(movieId)
    const existingChapter = chapters.find((chapter) => chapter.title.toLowerCase() === chapterTitle.toLowerCase())

    if (existingChapter) {
      return {
        exists: true,
        chapterId: existingChapter.id,
        movieTitle: movie.title,
      }
    }

    return { exists: false }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-500">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500">Admin</Badge>
      case "editor":
        return <Badge className="bg-blue-500">Editor</Badge>
      case "user":
        return <Badge variant="outline">User</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getMovieById = (id: number) => {
    return allMovies.find((movie) => movie.id === id)
  }

  const getChapterById = (id: number) => {
    return allChapters.find((chapter) => chapter.id === id)
  }

  const getServerById = (id: number) => {
    return allServers.find((server) => server.id === id)
  }

  const getChaptersByMovieId = (movieId: number) => {
    return allChapters.filter((chapter) => chapter.movieId === movieId)
  }

  const getServersByChapterId = (chapterId: number) => {
    const assignments = chapterServerAssignments.filter((assignment) => assignment.chapterId === chapterId)
    return assignments.map((assignment) => getServerById(assignment.serverId))
  }

  // Filter functions
  const applyMovieFilters = (movie: any) => {
    if (movieFilters.category && movieFilters.category !== "all" && movie.category !== movieFilters.category)
      return false
    if (movieFilters.genre && movieFilters.genre !== "all" && movie.genre !== movieFilters.genre) return false
    if (movieFilters.status && movieFilters.status !== "all" && movie.status !== movieFilters.status) return false
    if (movieFilters.year && movieFilters.year !== "all" && movie.year.toString() !== movieFilters.year) return false
    return true
  }

  const applyUserFilters = (user: any) => {
    if (userFilters.status && userFilters.status !== "all" && user.status !== userFilters.status) return false
    if (userFilters.role && userFilters.role !== "all" && user.role !== userFilters.role) return false
    if (userFilters.joinDate && userFilters.joinDate !== "all") {
      const filterYear = userFilters.joinDate
      const userYear = new Date(user.joinDate).getFullYear().toString()
      if (userYear !== filterYear) return false
    }
    return true
  }

  const applyNewsFilters = (article: any) => {
    if (newsFilters.category && newsFilters.category !== "all" && article.category !== newsFilters.category)
      return false
    if (newsFilters.status && newsFilters.status !== "all" && article.status !== newsFilters.status) return false
    if (newsFilters.author && newsFilters.author !== "all" && article.author !== newsFilters.author) return false
    return true
  }

  const applyCelebrityFilters = (celebrity: any) => {
    if (celebrityFilters.role && celebrityFilters.role !== "all" && celebrity.role !== celebrityFilters.role)
      return false
    if (celebrityFilters.status && celebrityFilters.status !== "all" && celebrity.status !== celebrityFilters.status)
      return false
    return true
  }

  const resetMovieFilters = () => {
    setMovieFilters({
      category: "all",
      genre: "all",
      status: "all",
      year: "all",
    })
    setMovieFilterOpen(false)
  }

  const resetUserFilters = () => {
    setUserFilters({
      status: "all",
      role: "all",
      joinDate: "all",
    })
    setUserFilterOpen(false)
  }

  const resetNewsFilters = () => {
    setNewsFilters({
      category: "all",
      status: "all",
      author: "all",
    })
    setNewsFilterOpen(false)
  }

  const resetCelebrityFilters = () => {
    setCelebrityFilters({
      role: "all",
      status: "all",
    })
    setCelebrityFilterOpen(false)
  }

  // Get unique years from movies for filter
  const getUniqueMovieYears = () => {
    const years = allMovies.map((movie) => movie.year.toString())
    return [...new Set(years)].sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }

  // Get unique years from user join dates for filter
  const getUniqueUserJoinYears = () => {
    const years = allUsers.map((user) => new Date(user.joinDate).getFullYear().toString())
    return [...new Set(years)].sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }

  // Get unique authors from news articles for filter
  const getUniqueNewsAuthors = () => {
    const authors = allNews.map((article) => article.author)
    return [...new Set(authors)].sort()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar activeItem={activeTab} onItemClick={setActiveTab} onCollapsedChange={handleSidebarCollapse} />

        {/* Main Content */}
        <div
          className={`flex-1 p-8 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your website content and users</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Cards — live API + legacy mock fallback label */}
              <AdminLiveStats />

              <AdminModerationSection />
            </div>
          )}

          {/* Movies Tab */}
          {activeTab === "movies" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Movies</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search movies..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Popover open={movieFilterOpen} onOpenChange={setMovieFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Movies</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={movieFilters.category}
                            onValueChange={(value) => setMovieFilters({ ...movieFilters, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {movieCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Genre</label>
                          <Select
                            value={movieFilters.genre}
                            onValueChange={(value) => setMovieFilters({ ...movieFilters, genre: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Genres" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genres</SelectItem>
                              {movieGenres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={movieFilters.status}
                            onValueChange={(value) => setMovieFilters({ ...movieFilters, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Year</label>
                          <Select
                            value={movieFilters.year}
                            onValueChange={(value) => setMovieFilters({ ...movieFilters, year: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {getUniqueMovieYears().map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={resetMovieFilters}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={() => setMovieFilterOpen(false)}>
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={() => setCreateMovieDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Movie
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="movies">
                <TabsList className="mb-6">
                  <TabsTrigger value="movies">Movies</TabsTrigger>
                  <TabsTrigger value="chapters">Chapters</TabsTrigger>
                  <TabsTrigger value="servers">Servers</TabsTrigger>
                </TabsList>

                <TabsContent value="movies">
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Movie</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Chapters</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allMovies
                          .filter(
                            (movie) =>
                              (movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                movie.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                movie.genre.toLowerCase().includes(searchQuery.toLowerCase())) &&
                              applyMovieFilters(movie),
                          )
                          .map((movie) => (
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
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{movie.category}</TableCell>
                              <TableCell>{movie.genre}</TableCell>
                              <TableCell>{movie.year}</TableCell>
                              <TableCell>{getStatusBadge(movie.status)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {movie.chapters.length}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedMovie(movie.id)
                                        setChapterDialogOpen(true)
                                      }}
                                    >
                                      <Layers className="h-4 w-4 mr-2" /> Add Chapter
                                    </DropdownMenuItem>
                                    {movie.status === "pending" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedItem(movie.id)
                                            setApproveDialogOpen(true)
                                          }}
                                        >
                                          <Check className="h-4 w-4 mr-2" /> Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedItem(movie.id)
                                            setRejectDialogOpen(true)
                                          }}
                                        >
                                          <X className="h-4 w-4 mr-2" /> Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedItem(movie.id)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="chapters">
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <div className="p-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">All Chapters</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedChapter(null)
                            setChapterDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Chapter
                        </Button>
                        <Button onClick={() => setAssignmentDialogOpen(true)}>
                          <LinkIcon className="h-4 w-4 mr-2" /> Assign Server
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Movie</TableHead>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Servers</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allChapters
                          .filter((chapter) => {
                            const movie = getMovieById(chapter.movieId)
                            return (
                              movie &&
                              (movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                chapter.title.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                          })
                          .map((chapter) => {
                            const movie = getMovieById(chapter.movieId)
                            const servers = getServersByChapterId(chapter.id)

                            return (
                              <TableRow key={chapter.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                      <Film className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <span>{movie?.title}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{chapter.title}</TableCell>
                                <TableCell>{chapter.duration}</TableCell>
                                <TableCell>{chapter.order}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {servers.map(
                                      (server) =>
                                        server && (
                                          <Badge key={server.id} variant="outline" className="text-xs">
                                            {server.name} ({server.quality})
                                          </Badge>
                                        ),
                                    )}
                                    {servers.length === 0 && (
                                      <span className="text-xs text-muted-foreground">No servers</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedChapter(chapter.id)
                                          setSelectedMovie(chapter.movieId)
                                          setChapterFormData({
                                            title: chapter.title,
                                            duration: chapter.duration,
                                            order: chapter.order,
                                          })
                                          setChapterDialogOpen(true)
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setAssignmentFormData({
                                            ...assignmentFormData,
                                            chapterId: chapter.id.toString(),
                                          })
                                          setAssignmentDialogOpen(true)
                                        }}
                                      >
                                        <LinkIcon className="h-4 w-4 mr-2" /> Assign Server
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          setSelectedItem(chapter.id)
                                          setDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="servers">
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <div className="p-4 flex justify-between items-center">
                      <h3 className="text-lg font-medium">All Servers</h3>
                      <Button
                        onClick={() => {
                          setSelectedServer(null)
                          setServerDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Server
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Quality</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Used In</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allServers
                          .filter(
                            (server) =>
                              server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              server.quality.toLowerCase().includes(searchQuery.toLowerCase()),
                          )
                          .map((server) => {
                            const assignments = chapterServerAssignments.filter((a) => a.serverId === server.id)

                            return (
                              <TableRow key={server.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-gray-500" />
                                    <span>{server.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{server.quality}</Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs font-mono truncate max-w-[200px] block">{server.url}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">
                                    {assignments.length} chapters
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedServer(server.id)
                                          setServerFormData({
                                            name: server.name,
                                            quality: server.quality,
                                            url: server.url,
                                          })
                                          setServerDialogOpen(true)
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => {
                                          setSelectedItem(server.id)
                                          setDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Users</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Popover open={userFilterOpen} onOpenChange={setUserFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Users</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={userFilters.status}
                            onValueChange={(value) => setUserFilters({ ...userFilters, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Role</label>
                          <Select
                            value={userFilters.role}
                            onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              {userRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Join Year</label>
                          <Select
                            value={userFilters.joinDate}
                            onValueChange={(value) => setUserFilters({ ...userFilters, joinDate: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {getUniqueUserJoinYears().map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={resetUserFilters}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={() => setUserFilterOpen(false)}>
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={() => setCreateUserDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add User
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers
                      .filter(
                        (user) =>
                          (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
                          applyUserFilters(user),
                      )
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.uploads}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {user.status === "active" ? (
                                  <DropdownMenuItem className="text-amber-600">
                                    <X className="h-4 w-4 mr-2" /> Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="text-green-600">
                                    <Check className="h-4 w-4 mr-2" /> Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedItem(user.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === "news" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">News Articles</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Popover open={newsFilterOpen} onOpenChange={setNewsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Articles</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={newsFilters.category}
                            onValueChange={(value) => setNewsFilters({ ...newsFilters, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {newsCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={newsFilters.status}
                            onValueChange={(value) => setNewsFilters({ ...newsFilters, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Author</label>
                          <Select
                            value={newsFilters.author}
                            onValueChange={(value) => setNewsFilters({ ...newsFilters, author: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Authors" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Authors</SelectItem>
                              {getUniqueNewsAuthors().map((author) => (
                                <SelectItem key={author} value={author}>
                                  {author}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={resetNewsFilters}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={() => setNewsFilterOpen(false)}>
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={() => setCreateArticleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Article
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allNews
                      .filter(
                        (article) =>
                          (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
                          applyNewsFilters(article),
                      )
                      .map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={article.thumbnail || "/placeholder.svg"}
                                alt={article.title}
                                width={80}
                                height={45}
                                className="rounded"
                              />
                              <div>
                                <p className="font-medium">{article.title}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>{article.category}</TableCell>
                          <TableCell>{new Date(article.publishDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(article.status)}</TableCell>
                          <TableCell>{article.views.toLocaleString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {article.status === "draft" && (
                                  <DropdownMenuItem className="text-green-600">
                                    <Check className="h-4 w-4 mr-2" /> Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedItem(article.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Celebrities Tab */}
          {activeTab === "celebrities" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Celebrities</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search celebrities..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Popover open={celebrityFilterOpen} onOpenChange={setCelebrityFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Celebrities</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Role</label>
                          <Select
                            value={celebrityFilters.role}
                            onValueChange={(value) => setCelebrityFilters({ ...celebrityFilters, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              {celebrityRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={celebrityFilters.status}
                            onValueChange={(value) => setCelebrityFilters({ ...celebrityFilters, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={resetCelebrityFilters}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={() => setCelebrityFilterOpen(false)}>
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={() => setCreateCelebrityDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Celebrity
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Celebrity</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Movies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCelebrities
                      .filter(
                        (celebrity) =>
                          (celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            celebrity.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
                          applyCelebrityFilters(celebrity),
                      )
                      .map((celebrity) => (
                        <TableRow key={celebrity.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src={celebrity.avatar || "/placeholder.svg"}
                                alt={celebrity.name}
                                width={50}
                                height={50}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-medium">{celebrity.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{celebrity.role}</TableCell>
                          <TableCell>{celebrity.movies}</TableCell>
                          <TableCell>{getStatusBadge(celebrity.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {celebrity.status === "active" ? (
                                  <DropdownMenuItem className="text-amber-600">
                                    <X className="h-4 w-4 mr-2" /> Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="text-green-600">
                                    <Check className="h-4 w-4 mr-2" /> Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedItem(celebrity.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="border rounded-md p-2 flex-1">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md h-24 w-24 bg-gray-50 mx-auto">
                    {createUserFormData.avatar ? (
                      <Image
                        src={createUserFormData.avatar || "/placeholder.svg"}
                        alt="Avatar preview"
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <User className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Upload avatar</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateUserFormData({
                      ...createUserFormData,
                      avatar: "/placeholder.svg?height=96&width=96",
                    })
                  }
                >
                  Upload
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={createUserFormData.name}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={createUserFormData.username}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={createUserFormData.email}
                onChange={(e) => setCreateUserFormData({ ...createUserFormData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={createUserFormData.password}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  value={createUserFormData.confirmPassword}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={createUserFormData.role}
                  onValueChange={(value) => setCreateUserFormData({ ...createUserFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={createUserFormData.status}
                  onValueChange={(value) => setCreateUserFormData({ ...createUserFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !createUserFormData.name ||
                !createUserFormData.username ||
                !createUserFormData.email ||
                !createUserFormData.password ||
                createUserFormData.password !== createUserFormData.confirmPassword
              }
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Article Dialog */}
      <Dialog open={createArticleDialogOpen} onOpenChange={setCreateArticleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>Fill in the details to create a new news article.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail</label>
              <div className="flex items-center gap-4">
                <div className="border rounded-md p-2 flex-1">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md h-32 bg-gray-50">
                    {createArticleFormData.thumbnail ? (
                      <Image
                        src={createArticleFormData.thumbnail || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        width={200}
                        height={120}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateArticleFormData({
                      ...createArticleFormData,
                      thumbnail: "/placeholder.svg?height=120&width=200",
                    })
                  }
                >
                  Upload
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={createArticleFormData.title}
                onChange={(e) => setCreateArticleFormData({ ...createArticleFormData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input
                  value={createArticleFormData.author}
                  onChange={(e) => setCreateArticleFormData({ ...createArticleFormData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={createArticleFormData.category}
                  onValueChange={(value) => setCreateArticleFormData({ ...createArticleFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {newsCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={createArticleFormData.content}
                onChange={(e) => setCreateArticleFormData({ ...createArticleFormData, content: e.target.value })}
                placeholder="Enter article content"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={createArticleFormData.tags}
                  onChange={(e) => setCreateArticleFormData({ ...createArticleFormData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas (e.g. movies, action, review)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={createArticleFormData.status}
                  onValueChange={(value) => setCreateArticleFormData({ ...createArticleFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateArticleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateArticle}
              disabled={
                !createArticleFormData.title || !createArticleFormData.author || !createArticleFormData.category
              }
            >
              {createArticleFormData.status === "published" ? "Publish Article" : "Save as Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Celebrity Dialog */}
      <Dialog open={createCelebrityDialogOpen} onOpenChange={setCreateCelebrityDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Celebrity</DialogTitle>
            <DialogDescription>Fill in the details to add a new celebrity.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="border rounded-md p-2 flex-1">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md h-32 w-32 bg-gray-50 mx-auto">
                    {createCelebrityFormData.avatar ? (
                      <Image
                        src={createCelebrityFormData.avatar || "/placeholder.svg"}
                        alt="Avatar preview"
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Upload avatar</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateCelebrityFormData({
                      ...createCelebrityFormData,
                      avatar: "/placeholder.svg?height=128&width=128",
                    })
                  }
                >
                  Upload
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={createCelebrityFormData.name}
                  onChange={(e) => setCreateCelebrityFormData({ ...createCelebrityFormData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={createCelebrityFormData.role}
                  onValueChange={(value) => setCreateCelebrityFormData({ ...createCelebrityFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {celebrityRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Biography</label>
              <Textarea
                value={createCelebrityFormData.bio}
                onChange={(e) => setCreateCelebrityFormData({ ...createCelebrityFormData, bio: e.target.value })}
                placeholder="Enter biography"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Birth Date</label>
                <Input
                  type="date"
                  value={createCelebrityFormData.birthDate}
                  onChange={(e) =>
                    setCreateCelebrityFormData({ ...createCelebrityFormData, birthDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Birth Place</label>
                <Input
                  value={createCelebrityFormData.birthPlace}
                  onChange={(e) =>
                    setCreateCelebrityFormData({ ...createCelebrityFormData, birthPlace: e.target.value })
                  }
                  placeholder="e.g. Los Angeles, USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Height</label>
                <Input
                  value={createCelebrityFormData.height}
                  onChange={(e) => setCreateCelebrityFormData({ ...createCelebrityFormData, height: e.target.value })}
                  placeholder="e.g. 6' 2&quot; (1.88 m)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={createCelebrityFormData.status}
                  onValueChange={(value) => setCreateCelebrityFormData({ ...createCelebrityFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter</label>
                  <Input
                    value={createCelebrityFormData.twitter}
                    onChange={(e) =>
                      setCreateCelebrityFormData({ ...createCelebrityFormData, twitter: e.target.value })
                    }
                    placeholder="e.g. @username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    value={createCelebrityFormData.instagram}
                    onChange={(e) =>
                      setCreateCelebrityFormData({ ...createCelebrityFormData, instagram: e.target.value })
                    }
                    placeholder="e.g. @username"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateCelebrityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCelebrity}
              disabled={!createCelebrityFormData.name || !createCelebrityFormData.role}
            >
              Create Celebrity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Movie Dialog */}
      <Dialog open={createMovieDialogOpen} onOpenChange={setCreateMovieDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Movie</DialogTitle>
            <DialogDescription>Fill in the details to create a new movie.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Movie Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Movie Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={createMovieFormData.title}
                    onChange={(e) => setCreateMovieFormData({ ...createMovieFormData, title: e.target.value })}
                    placeholder="Enter movie title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={createMovieFormData.category}
                    onValueChange={(value) => setCreateMovieFormData({ ...createMovieFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {movieCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genre</label>
                  <Select
                    value={createMovieFormData.genre}
                    onValueChange={(value) => setCreateMovieFormData({ ...createMovieFormData, genre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {movieGenres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    type="number"
                    value={createMovieFormData.year}
                    onChange={(e) =>
                      setCreateMovieFormData({
                        ...createMovieFormData,
                        year: Number.parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                    placeholder="Enter release year"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={createMovieFormData.description}
                  onChange={(e) => setCreateMovieFormData({ ...createMovieFormData, description: e.target.value })}
                  placeholder="Enter movie description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail</label>
                <div className="flex items-center gap-4">
                  <div className="border rounded-md p-2 flex-1">
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md h-32 bg-gray-50">
                      {createMovieFormData.thumbnail ? (
                        <Image
                          src={createMovieFormData.thumbnail || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          width={200}
                          height={120}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCreateMovieFormData({
                        ...createMovieFormData,
                        thumbnail: "/placeholder.svg?height=120&width=200",
                      })
                    }
                  >
                    Upload
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={createMovieFormData.status}
                  onValueChange={(value) => setCreateMovieFormData({ ...createMovieFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chapter & Server Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Chapters & Servers</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeChapter"
                    checked={includeChapter}
                    onCheckedChange={(checked) => setIncludeChapter(checked === true)}
                  />
                  <Label
                    htmlFor="includeChapter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include chapters
                  </Label>
                </div>
              </div>

              {includeChapter && (
                <div className="space-y-6">
                  {createMovieChapters.map((chapter, index) => (
                    <div key={chapter.id} className="space-y-4 pl-4 border-l-2 border-gray-100 pt-4 relative">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium">Chapter {index + 1}</h4>
                        {createMovieChapters.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 absolute right-0 top-0"
                            onClick={() => removeChapter(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove Chapter</span>
                          </Button>
                        )}
                      </div>

                      {/* Chapter Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Chapter Title</label>
                          <Input
                            value={chapter.title}
                            onChange={(e) => updateChapter(index, "title", e.target.value)}
                            placeholder="e.g. Chapter 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Duration</label>
                          <Input
                            value={chapter.duration}
                            onChange={(e) => updateChapter(index, "duration", e.target.value)}
                            placeholder="e.g. 45 min"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Order</label>
                        <Input
                          type="number"
                          min="1"
                          value={chapter.order}
                          onChange={(e) => updateChapter(index, "order", Number.parseInt(e.target.value) || 1)}
                          placeholder="e.g. 1"
                        />
                      </div>

                      {/* Server Details */}
                      <div className="space-y-4 mt-6 pl-4 border-l-2 border-gray-100">
                        <h4 className="text-md font-medium">Server Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Server Name</label>
                            <Input
                              value={chapter.server.name}
                              onChange={(e) => updateChapterServer(index, "name", e.target.value)}
                              placeholder="e.g. Server 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Quality</label>
                            <Select
                              value={chapter.server.quality}
                              onValueChange={(value) => updateChapterServer(index, "quality", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SD">SD</SelectItem>
                                <SelectItem value="HD">HD</SelectItem>
                                <SelectItem value="4K">4K</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Server URL</label>
                          <Input
                            value={chapter.server.url}
                            onChange={(e) => updateChapterServer(index, "url", e.target.value)}
                            placeholder="e.g. https://example.com/server1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Chapter Button */}
                  <Button type="button" variant="outline" className="w-full mt-4" onClick={addChapter}>
                    <Plus className="h-4 w-4 mr-2" /> Add Another Chapter
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCreateMovieDialogOpen(false)
                // Reset form data
                setCreateMovieFormData({
                  title: "",
                  category: "",
                  genre: "",
                  year: new Date().getFullYear(),
                  description: "",
                  thumbnail: "",
                  status: "published",
                })
                setCreateMovieChapters([
                  {
                    id: 1,
                    title: "Chapter 1",
                    duration: "45 min",
                    order: 1,
                    server: {
                      name: "Server 1",
                      quality: "HD",
                      url: "",
                    },
                  },
                ])
                setIncludeChapter(true)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMovie}
              disabled={
                !createMovieFormData.title ||
                !createMovieFormData.category ||
                !createMovieFormData.genre ||
                (includeChapter &&
                  createMovieChapters.some(
                    (chapter) => !chapter.title || !chapter.duration || !chapter.server.name || !chapter.server.url,
                  ))
              }
            >
              Create Movie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Movie</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this movie? It will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applyAsChapter"
                checked={applyAsChapter}
                onCheckedChange={(checked) => setApplyAsChapter(checked === true)}
              />
              <Label
                htmlFor="applyAsChapter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Apply as movie chapter
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              If checked, this movie will be added as a chapter to an existing movie.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false)
                setApplyAsChapter(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveMovie}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply as Chapter Dialog */}
      <Dialog open={applyAsChapterDialogOpen} onOpenChange={setApplyAsChapterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply as Movie Chapter</DialogTitle>
            <DialogDescription>Select a movie and enter chapter details to proceed.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Movie Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Movie</label>
              <Select
                value={selectedMovie?.toString() || ""}
                onValueChange={(value) => {
                  const movieId = Number.parseInt(value)
                  setSelectedMovie(movieId)

                  const approvedPending = allMovies.find((m) => m.id === selectedItem && m.status === "pending")
                  if (approvedPending) {
                    setChapterFormData({
                      title: approvedPending.title,
                      duration: "45 min",
                      order: getChaptersByMovieId(movieId).length + 1,
                    })
                  }

                  // Reset existing chapter check when movie changes
                  setExistingChapterCheck({ exists: false })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select movie" />
                </SelectTrigger>
                <SelectContent>
                  {allMovies
                    .filter((movie) => movie.status === "published")
                    .map((movie) => (
                      <SelectItem key={movie.id} value={movie.id.toString()}>
                        {movie.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Only show chapter title input if a movie is selected */}
            {selectedMovie && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter Title</label>
                <Input
                  value={chapterFormData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setChapterFormData({ ...chapterFormData, title: newTitle })

                    // Check if this chapter title already exists for the selected movie
                    if (selectedMovie && newTitle.trim()) {
                      const checkResult = checkExistingChapter(selectedMovie, newTitle)
                      setExistingChapterCheck(checkResult)
                    } else {
                      setExistingChapterCheck({ exists: false })
                    }
                  }}
                  placeholder="Enter chapter title"
                />
              </div>
            )}

            {/* Show notification if chapter exists */}
            {selectedMovie && chapterFormData.title && existingChapterCheck.exists && (
              <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                <p className="text-amber-800 font-medium">
                  A chapter with this title already exists in "{existingChapterCheck.movieTitle}".
                </p>
                <p className="text-sm text-amber-700 mt-1">A new server will be created for the existing chapter.</p>
              </div>
            )}

            {/* Chapter details (only if chapter doesn't exist) */}
            {selectedMovie && chapterFormData.title && !existingChapterCheck.exists && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    value={chapterFormData.duration}
                    onChange={(e) => setChapterFormData({ ...chapterFormData, duration: e.target.value })}
                    placeholder="e.g. 45 min"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Input
                    type="number"
                    min="1"
                    value={chapterFormData.order}
                    onChange={(e) => setChapterFormData({ ...chapterFormData, order: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* Server details (always shown) */}
            {selectedMovie && chapterFormData.title && (
              <div className="space-y-2 border-t pt-4 mt-4">
                <label className="text-sm font-medium">Server Details</label>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Server Name</label>
                  <Input
                    value={serverFormData.name}
                    onChange={(e) => setServerFormData({ ...serverFormData, name: e.target.value })}
                    placeholder="e.g. Server 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Quality</label>
                  <Select
                    value={serverFormData.quality}
                    onValueChange={(value) => setServerFormData({ ...serverFormData, quality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="HD">HD</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Server URL</label>
                  <Input
                    value={serverFormData.url}
                    onChange={(e) => setServerFormData({ ...serverFormData, url: e.target.value })}
                    placeholder="e.g. https://example.com/server1"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setApplyAsChapterDialogOpen(false)
                setApproveDialogOpen(false)
                setApplyAsChapter(false)
                setExistingChapterCheck({ exists: false })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyAsChapter}
              disabled={!selectedMovie || !chapterFormData.title || !serverFormData.name || !serverFormData.url}
            >
              {existingChapterCheck.exists ? "Add Server to Chapter" : "Create Chapter & Server"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Movie</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this movie.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea placeholder="Rejection reason" className="resize-none" rows={4} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectMovie}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
