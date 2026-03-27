"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface WriteReviewDialogProps {
  movieTitle: string
  movieId: string
}

export function WriteReviewDialog({ movieTitle, movieId }: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would send the review data to your API
    console.log({
      movieId,
      rating,
      reviewTitle,
      reviewContent,
    })

    // Reset form and close dialog
    setRating(0)
    setReviewTitle("")
    setReviewContent("")
    setIsSubmitting(false)
    setOpen(false)

    // Show success message (in a real app, you might use a toast notification)
    alert("Review submitted successfully!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your thoughts about &quot;{movieTitle}&quot; with other users.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Your Rating</Label>
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${
                      i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{rating > 0 ? `${rating}/10` : "Select rating"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewTitle">Review Title</Label>
              <Input
                id="reviewTitle"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your thoughts"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewContent">Your Review</Label>
              <div className="border rounded-md p-1">
                <div className="flex items-center gap-1 border-b p-1 mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-base font-bold"
                    onClick={() => setReviewContent((prev) => prev + "**Bold Text**")}
                  >
                    B
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-base italic"
                    onClick={() => setReviewContent((prev) => prev + "*Italic Text*")}
                  >
                    I
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setReviewContent((prev) => prev + "\n• List item")}
                  >
                    • List
                  </Button>
                </div>
                <Textarea
                  id="reviewContent"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Write your detailed review here. You can use **bold** and *italic* formatting."
                  className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Tip: Use **text** for bold and *text* for italics</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
