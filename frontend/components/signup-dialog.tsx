"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export function SignupDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>SIGN UP</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Sign Up</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username-signup">Username:</Label>
            <Input id="username-signup" placeholder="Hugh Jackman" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">Your Email:</Label>
            <Input id="email-signup" type="email" placeholder="email@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password:</Label>
            <Input id="password-signup" type="password" placeholder="******" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repassword-signup">Re-type Password:</Label>
            <Input id="repassword-signup" type="password" placeholder="******" required />
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
