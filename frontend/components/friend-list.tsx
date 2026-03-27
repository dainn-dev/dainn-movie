"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, UserMinus } from "lucide-react"

interface Friend {
  id: string
  name: string
  username: string
  avatar: string
  isOnline: boolean
}

interface FriendListProps {
  friends: Friend[]
  onRemoveFriend?: (id: string) => void
  onStartChat?: (id: string) => void
  compact?: boolean
}

export function FriendList({ friends, onRemoveFriend, onStartChat, compact = false }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No friends yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            <div>
              <Link href={`/user/${friend.username}`} className="font-medium hover:text-primary">
                {friend.name}
              </Link>
              {!compact && <p className="text-xs text-muted-foreground">@{friend.username}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {onStartChat && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onStartChat(friend.id)}
                title="Start chat"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            {onRemoveFriend && !compact && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onRemoveFriend(friend.id)}
                title="Remove friend"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
