"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, UserX, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type FriendStatus = "none" | "pending" | "requested" | "friends"

interface FriendButtonProps {
  userId: string
  initialStatus?: FriendStatus
}

export function FriendButton({ userId, initialStatus = "none" }: FriendButtonProps) {
  const [status, setStatus] = useState<FriendStatus>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleFriendAction = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      switch (status) {
        case "none":
          setStatus("pending")
          toast({
            title: "Friend request sent",
            description: "They'll be notified of your request.",
          })
          break
        case "requested":
          setStatus("friends")
          toast({
            title: "Friend request accepted",
            description: "You are now friends!",
          })
          break
        case "pending":
          setStatus("none")
          toast({
            title: "Friend request canceled",
            description: "Your request has been withdrawn.",
          })
          break
        case "friends":
          setStatus("none")
          toast({
            title: "Friend removed",
            description: "This user has been removed from your friends.",
          })
          break
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem processing your request.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Processing
      </Button>
    )
  }

  switch (status) {
    case "none":
      return (
        <Button onClick={handleFriendAction}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      )
    case "pending":
      return (
        <Button variant="outline" onClick={handleFriendAction}>
          <UserX className="h-4 w-4 mr-2" />
          Cancel Request
        </Button>
      )
    case "requested":
      return (
        <div className="flex gap-2">
          <Button onClick={handleFriendAction}>
            <UserCheck className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => setStatus("none")}>
            <UserX className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>
      )
    case "friends":
      return (
        <Button variant="outline" onClick={handleFriendAction}>
          <UserCheck className="h-4 w-4 mr-2" />
          Friends
        </Button>
      )
  }
}
