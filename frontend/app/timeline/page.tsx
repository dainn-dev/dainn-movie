"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Share, MoreHorizontal, Send, ThumbsUp, Calendar, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FriendButton } from "@/components/friend-button"
import { PrivacySelector, type PrivacyLevel } from "@/components/privacy-selector"

// Mock data for timeline posts
const timelinePosts = [
  {
    id: 1,
    user: {
      name: "Edward Kennedy",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "edward_kennedy",
    },
    date: "2 hours ago",
    content: "Just watched Interstellar for the third time. Still blown away by the visual effects and storyline!",
    movie: {
      id: 1,
      title: "Interstellar",
      year: 2014,
      image: "/placeholder.svg?height=200&width=350",
      director: "Christopher Nolan",
    },
    likes: 42,
    privacy: "public" as PrivacyLevel,
    comments: [
      {
        id: 1,
        user: {
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          username: "sarah_j",
        },
        content: "One of my all-time favorites! The soundtrack by Hans Zimmer is incredible too.",
        date: "1 hour ago",
        likes: 8,
      },
      {
        id: 2,
        user: {
          name: "Michael Chen",
          avatar: "/placeholder.svg?height=40&width=40",
          username: "mike_c",
        },
        content: "The black hole scene still gives me chills every time I watch it.",
        date: "45 minutes ago",
        likes: 5,
      },
    ],
  },
  {
    id: 2,
    user: {
      name: "Jessica Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "jess_w",
    },
    date: "Yesterday",
    content: "Just got tickets to the premiere of the new Marvel movie! Anyone else going?",
    likes: 28,
    privacy: "friends" as PrivacyLevel,
    comments: [],
  },
  {
    id: 3,
    user: {
      name: "Robert Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "rob_d",
    },
    date: "3 days ago",
    content: "My ranking of all Christopher Nolan films:",
    listItems: ["1. The Dark Knight", "2. Inception", "3. Interstellar", "4. Memento", "5. The Prestige"],
    likes: 76,
    privacy: "public" as PrivacyLevel,
    comments: [
      {
        id: 3,
        user: {
          name: "Amanda Lee",
          avatar: "/placeholder.svg?height=40&width=40",
          username: "amanda_l",
        },
        content: "I'd put Inception at #1, but solid list otherwise!",
        date: "2 days ago",
        likes: 12,
      },
    ],
  },
  {
    id: 4,
    user: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "dave_w",
    },
    date: "1 week ago",
    content: "Just finished watching the entire Lord of the Rings extended trilogy. What a journey!",
    movie: {
      id: 4,
      title: "The Lord of the Rings: The Return of the King",
      year: 2003,
      image: "/placeholder.svg?height=200&width=350",
      director: "Peter Jackson",
    },
    likes: 104,
    privacy: "public" as PrivacyLevel,
    comments: [],
  },
]

// Upcoming movie releases
const upcomingMovies = [
  {
    id: 1,
    title: "Dune: Part Two",
    date: "March 1, 2025",
    image: "/placeholder.svg?height=100&width=70",
  },
  {
    id: 2,
    title: "Mission: Impossible 8",
    date: "May 23, 2025",
    image: "/placeholder.svg?height=100&width=70",
  },
  {
    id: 3,
    title: "Avatar 3",
    date: "December 19, 2025",
    image: "/placeholder.svg?height=100&width=70",
  },
]

// Trending topics
const trendingTopics = [
  "#MarvelPhase5",
  "#OscarNominations",
  "#DuneMovie",
  "#ChristopherNolan",
  "#DCUniverse",
  "#StarWars",
  "#TopGun3",
]

export default function TimelinePage() {
  const [newPost, setNewPost] = useState("")
  const [postPrivacy, setPostPrivacy] = useState<PrivacyLevel>("public")
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [likedComments, setLikedComments] = useState<number[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})

  const handleLikePost = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId))
    } else {
      setLikedPosts([...likedPosts, postId])
    }
  }

  const handleLikeComment = (commentId: number) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter((id) => id !== commentId))
    } else {
      setLikedComments([...likedComments, commentId])
    }
  }

  const handleToggleComments = (postId: number) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    })
  }

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value,
    })
  }

  const handleSubmitComment = (postId: number) => {
    if (commentInputs[postId]?.trim()) {
      // In a real app, you would send this to your API
      console.log(`New comment on post ${postId}: ${commentInputs[postId]}`)

      // Clear the input
      setCommentInputs({
        ...commentInputs,
        [postId]: "",
      })
    }
  }

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      // In a real app, you would send this to your API
      console.log(`New post: ${newPost} with privacy: ${postPrivacy}`)

      // Clear the input
      setNewPost("")
    }
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Movie Timeline</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">•</span>
            <span>Timeline</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your profile" />
                  <AvatarFallback>YP</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What movie are you watching today?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="mb-3 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-1" /> Tag Movie
                      </Button>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="h-4 w-4 mr-1" /> Add Photo
                      </Button>
                      <PrivacySelector defaultValue={postPrivacy} onChange={setPostPrivacy} />
                    </div>
                    <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Tabs */}
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-6">
                  {timelinePosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              <Link href={`/user/${post.user.username}`} className="hover:text-primary">
                                {post.user.name}
                              </Link>
                            </h4>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{post.date}</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="text-xs flex items-center">
                                {post.privacy === "public" && <Heart className="h-3 w-3 mr-1" />}
                                {post.privacy === "friends" && <Heart className="h-3 w-3 mr-1" />}
                                {post.privacy === "private" && <Heart className="h-3 w-3 mr-1" />}
                                {post.privacy}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FriendButton userId={post.user.username} initialStatus="none" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Save post</DropdownMenuItem>
                              <DropdownMenuItem>Report</DropdownMenuItem>
                              <DropdownMenuItem>Hide posts from this user</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="mb-3">{post.content}</p>
                        {post.listItems && (
                          <ul className="list-disc pl-5 mb-3">
                            {post.listItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        )}
                        {post.movie && (
                          <div className="border rounded-md p-3 mt-3 flex gap-3">
                            <Image
                              src={post.movie.image || "/placeholder.svg"}
                              alt={post.movie.title}
                              width={100}
                              height={150}
                              className="rounded-md"
                            />
                            <div>
                              <h5 className="font-medium">
                                <Link href={`/movies/${post.movie.id}`} className="hover:text-primary">
                                  {post.movie.title} ({post.movie.year})
                                </Link>
                              </h5>
                              <p className="text-sm text-muted-foreground">Directed by {post.movie.director}</p>
                              <Button variant="link" className="p-0 h-auto text-primary">
                                View Movie
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between border-t border-b py-2 mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={likedPosts.includes(post.id) ? "text-primary" : ""}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${likedPosts.includes(post.id) ? "fill-primary" : ""}`} />
                          Like {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleComments(post.id)}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Comment {post.comments.length > 0 ? post.comments.length : ""}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {(showComments[post.id] || post.comments.length > 0) && (
                        <div className="space-y-4">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <h6 className="font-medium text-sm">
                                      <Link href={`/user/${comment.user.username}`} className="hover:text-primary">
                                        {comment.user.name}
                                      </Link>
                                    </h6>
                                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleLikeComment(comment.id)}
                                  >
                                    <ThumbsUp
                                      className={`h-3 w-3 mr-1 ${
                                        likedComments.includes(comment.id) ? "fill-primary text-primary" : ""
                                      }`}
                                    />
                                    {comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Comment */}
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your profile" />
                              <AvatarFallback>YP</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Textarea
                                placeholder="Write a comment..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                className="resize-none min-h-[40px] text-sm py-2"
                              />
                              <Button
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="friends">
                <div className="p-8 text-center text-muted-foreground">
                  <p>View posts from your friends here.</p>
                </div>
              </TabsContent>

              <TabsContent value="movies">
                <div className="p-8 text-center text-muted-foreground">
                  <p>View movie-related posts here.</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="p-8 text-center text-muted-foreground">
                  <p>View movie reviews here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              {/* Upcoming Movies */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-bold mb-4">Upcoming Releases</h4>
                <div className="space-y-4">
                  {upcomingMovies.map((movie) => (
                    <div key={movie.id} className="flex gap-3">
                      <Image
                        src={movie.image || "/placeholder.svg"}
                        alt={movie.title}
                        width={70}
                        height={100}
                        className="rounded-md"
                      />
                      <div>
                        <h6 className="font-medium">
                          <Link href={`/movies/${movie.id}`} className="hover:text-primary">
                            {movie.title}
                          </Link>
                        </h6>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> {movie.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Upcoming Movies
                </Button>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-bold mb-4">Trending Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${topic.replace("#", "")}`}
                      className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-sm"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Who to Follow */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h4 className="text-lg font-bold mb-4">Movie Enthusiasts to Follow</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Film Critic" />
                        <AvatarFallback>FC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h6 className="font-medium text-sm">Roger Ebert</h6>
                        <p className="text-xs text-muted-foreground">Film Critic</p>
                      </div>
                    </div>
                    <FriendButton userId="roger_ebert" initialStatus="none" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Director" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div>
                        <h6 className="font-medium text-sm">Christopher Nolan</h6>
                        <p className="text-xs text-muted-foreground">Director</p>
                      </div>
                    </div>
                    <FriendButton userId="christopher_nolan" initialStatus="none" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Actor" />
                        <AvatarFallback>TH</AvatarFallback>
                      </Avatar>
                      <div>
                        <h6 className="font-medium text-sm">Tom Hanks</h6>
                        <p className="text-xs text-muted-foreground">Actor</p>
                      </div>
                    </div>
                    <FriendButton userId="tom_hanks" initialStatus="none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
