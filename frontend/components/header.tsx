"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LoginDialog } from "@/components/login-dialog"
import { SignupDialog } from "@/components/signup-dialog"

export function Header() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/placeholder.svg?height=58&width=119" alt="Open Pediatrics" width={119} height={58} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <div className="hidden md:flex items-center space-x-2">
              <LoginDialog />
              <SignupDialog />
            </div>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="py-4 border-t">
            <div className="flex gap-2">
              <Select defaultValue="movies">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                  <SelectItem value="celebrities">Celebrities</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search for a movie, TV Show or celebrity that you are looking for"
                className="flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const links = [
    {
      name: "Home",
      href: "/",
      dropdown: [
        { name: "Home 01", href: "/" },
        { name: "Home 02", href: "/home-v2" },
        { name: "Home 03", href: "/home-v3" },
      ],
    },
    {
      name: "Movies",
      href: "/movies",
      dropdown: [
        { name: "Movie Grid", href: "/movies/grid" },
        { name: "Movie List", href: "/movies/list" },
        { name: "Movie Single", href: "/movies/1" },
      ],
    },
    {
      name: "Celebrities",
      href: "/celebrities",
      dropdown: [
        { name: "Celebrity Grid 01", href: "/celebrities/grid-1" },
        { name: "Celebrity Grid 02", href: "/celebrities/grid-2" },
        { name: "Celebrity List", href: "/celebrities/list" },
        { name: "Celebrity Single", href: "/celebrities/1" },
      ],
    },
    {
      name: "News",
      href: "/news",
      dropdown: [
        { name: "Blog List", href: "/news/list" },
        { name: "Blog Grid", href: "/news/grid" },
        { name: "Blog Detail", href: "/news/1" },
      ],
    },
    {
      name: "Community",
      href: "/community",
      dropdown: [
        { name: "User Favorite Grid", href: "/user/favorites/grid" },
        { name: "User Favorite List", href: "/user/favorites/list" },
        { name: "User Profile", href: "/user/profile" },
        { name: "User Rate", href: "/user/rate" },
      ],
    },
  ]

  if (mobile) {
    return (
      <div className="flex flex-col space-y-4">
        {links.map((link) => (
          <div key={link.name} className="flex flex-col">
            <Link href={link.href} className="text-lg font-medium">
              {link.name}
            </Link>
            {link.dropdown && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                {link.dropdown.map((item) => (
                  <Link key={item.name} href={item.href} className="text-sm text-muted-foreground">
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <LoginDialog />
        <SignupDialog />
      </div>
    )
  }

  return (
    <>
      {links.map((link) => (
        <div key={link.name} className="relative group">
          <Link href={link.href} className="px-3 py-2 text-sm font-medium hover:text-primary">
            {link.name}
          </Link>
          {link.dropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-background border rounded-md shadow-lg hidden group-hover:block z-50">
              <div className="py-1">
                {link.dropdown.map((item) => (
                  <Link key={item.name} href={item.href} className="block px-4 py-2 text-sm hover:bg-muted">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
