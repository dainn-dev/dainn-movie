"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

export function LoginDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">LOG IN</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Login</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username:</Label>
            <Input id="username" placeholder="Hugh Jackman" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password:</Label>
            <Input id="password" type="password" placeholder="******" required />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm">
                Remember me
              </label>
            </div>
            <Button variant="link" className="p-0 h-auto">
              Forget password?
            </Button>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="text-center">
            <p className="text-sm mb-2">Or via social</p>
            <div className="flex space-x-2 justify-center">
              <Button variant="outline" className="flex-1">
                Facebook
              </Button>
              <Button variant="outline" className="flex-1">
                Twitter
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
