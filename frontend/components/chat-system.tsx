"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, X, Send, Minimize, Maximize, Search } from "lucide-react"
import { FriendList } from "@/components/friend-list"

// Mock data for friends
const mockFriends = [
  {
    id: "1",
    name: "Sarah Johnson",
    username: "sarah_j",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    username: "mike_c",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "3",
    name: "Jessica Williams",
    username: "jess_w",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  {
    id: "4",
    name: "David Wilson",
    username: "dave_w",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "5",
    name: "Amanda Lee",
    username: "amanda_l",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
]

// Mock data for conversations
const mockConversations: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      text: "Hey, have you seen the new Marvel movie?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Not yet! Is it good?",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: "3",
      senderId: "1",
      text: "It's amazing! We should go watch it this weekend.",
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: "4",
      senderId: "current-user",
      text: "Sounds good! What time were you thinking?",
      timestamp: new Date(Date.now() - 3300000).toISOString(),
    },
  ],
  "2": [
    {
      id: "5",
      senderId: "2",
      text: "Did you check out that movie I recommended?",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "6",
      senderId: "current-user",
      text: "Yes! It was fantastic, thanks for the recommendation.",
      timestamp: new Date(Date.now() - 85000000).toISOString(),
    },
  ],
}

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
}

export function ChatSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockConversations)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter friends based on search query
  const filteredFriends = mockFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get active friend
  const activeFriend = activeChatId ? mockFriends.find((f) => f.id === activeChatId) : null

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, activeChatId, isMinimized, isOpen])

  const handleStartChat = (friendId: string) => {
    setActiveChatId(friendId)
    // Initialize conversation if it doesn't exist
    if (!messages[friendId]) {
      setMessages((prev) => ({
        ...prev,
        [friendId]: [],
      }))
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatId) return

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }))

    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <Button className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg" onClick={() => setIsOpen(true)}>
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border transition-all duration-300 z-50 ${
        isMinimized ? "w-72 h-12" : "w-[800px] h-[500px]"
      }`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">
            {activeChatId && !isMinimized ? `Chat with ${activeFriend?.name}` : "Movie Chat"}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(false)
              setActiveChatId(null)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="flex h-[calc(100%-56px)]">
          {/* Friends List */}
          <div className="w-1/3 border-r">
            <div className="p-3">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="online">
                <TabsList className="w-full mb-3">
                  <TabsTrigger value="online" className="flex-1">
                    Online
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">
                    All Friends
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="online">
                  <ScrollArea className="h-[370px]">
                    <FriendList
                      friends={filteredFriends.filter((f) => f.isOnline)}
                      onStartChat={handleStartChat}
                      compact
                    />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="all">
                  <ScrollArea className="h-[370px]">
                    <FriendList friends={filteredFriends} onStartChat={handleStartChat} compact />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {activeChatId ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messages[activeChatId]?.map((message) => {
                    const isCurrentUser = message.senderId === "current-user"
                    const sender = isCurrentUser
                      ? { name: "You", avatar: "/placeholder.svg?height=40&width=40" }
                      : mockFriends.find((f) => f.id === message.senderId)

                    return (
                      <div key={message.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={sender?.avatar || ""} />
                            <AvatarFallback>{sender?.name.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                  >
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                <p className="text-muted-foreground mb-4">Select a friend from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
