"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Menu, LogOut, User as UserIcon, Film, Star, Upload, Users, MessageCircle } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo1.png" alt="DMovie" width={119} height={58} />
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
                  <MobileAuthSection user={user} onLogout={handleLogout} />
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
              {user ? (
                <>
                  <NotificationBell />
                  <UserMenu user={user} onLogout={handleLogout} />
                </>
              ) : null}
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {!user && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </>
              )}
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

function UserMenu({ user, onLogout }: { user: { username: string; displayName: string; avatarUrl: string | null }; onLogout: () => void }) {
  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
            <AvatarFallback className="bg-primary text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium truncate">{user.displayName}</div>
        <div className="px-2 pb-1.5 text-xs text-muted-foreground truncate">@{user.username}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" /> Trang cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" /> Đăng phim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/friends" className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" /> Bạn bè
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/messages" className="cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" /> Tin nhắn
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/my-movies" className="cursor-pointer">
            <Film className="mr-2 h-4 w-4" /> Phim của tôi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/rated" className="cursor-pointer">
            <Star className="mr-2 h-4 w-4" /> Đã đánh giá
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileAuthSection({
  user,
  onLogout,
}: {
  user: { username: string; displayName: string; avatarUrl: string | null } | null
  onLogout: () => void
}) {
  if (user) {
    return (
      <div className="flex flex-col space-y-2 pt-2 border-t">
        <span className="text-sm font-medium">{user.displayName}</span>
        <Link href="/user/profile" className="text-sm text-muted-foreground">Trang cá nhân</Link>
        <Link href="/upload" className="text-sm text-muted-foreground">Đăng phim</Link>
        <Link href="/user/friends" className="text-sm text-muted-foreground">Bạn bè</Link>
        <Link href="/user/messages" className="text-sm text-muted-foreground">Tin nhắn</Link>
        <Link href="/user/my-movies" className="text-sm text-muted-foreground">Phim của tôi</Link>
        <button onClick={onLogout} className="text-sm text-destructive text-left">Đăng xuất</button>
      </div>
    )
  }
  return (
    <div className="flex flex-col space-y-2 pt-2 border-t">
      <Button variant="outline" asChild><Link href="/login">Đăng nhập</Link></Button>
      <Button className="bg-primary hover:bg-primary/90" asChild><Link href="/register">Đăng ký</Link></Button>
    </div>
  )
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const links = [
    { name: "Home", href: "/", dropdown: null },
    { name: "Movies", href: "/movies", dropdown: [{ name: "Movie Single", href: "/movies/1" }] },
    { name: "Celebrities", href: "/celebrities", dropdown: [{ name: "Celebrity Single", href: "/celebrities/1" }] },
    { name: "News", href: "/news", dropdown: [{ name: "Blog Detail", href: "/news/1" }] },
    {
      name: "Community",
      href: "/user",
      dropdown: [
        { name: "Upload", href: "/upload" },
        { name: "Friends", href: "/user/friends" },
        { name: "Messages", href: "/user/messages" },
        { name: "My Movies", href: "/user/my-movies" },
        { name: "Rated", href: "/user/rated" },
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

