import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserIcon, Heart, Star, Film, Settings, LogOut } from "lucide-react"

interface UserSidebarProps {
  activeItem: "profile" | "favorites" | "rated"
}

export default function UserSidebar({ activeItem }: UserSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/placeholder.svg?height=150&width=150"
          alt="User"
          width={150}
          height={150}
          className="rounded-full mb-4"
        />
        <Button variant="outline" size="sm">
          Change avatar
        </Button>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Details</h4>
        <ul className="space-y-2">
          <li>
            <Link
              href="/user/profile"
              className={`flex items-center px-3 py-2 rounded ${activeItem === "profile" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </li>
          <li>
            <Link
              href="/user/favorites/grid"
              className={`flex items-center px-3 py-2 rounded ${activeItem === "favorites" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorite movies
            </Link>
          </li>
          <li>
            <Link
              href="/user/rated"
              className={`flex items-center px-3 py-2 rounded ${activeItem === "rated" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            >
              <Star className="h-4 w-4 mr-2" />
              Rated movies
            </Link>
          </li>
          <li>
            <Link href="/user/my-movies" className={`flex items-center px-3 py-2 rounded hover:bg-gray-100`}>
              <Film className="h-4 w-4 mr-2" />
              My movies
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Others</h4>
        <ul className="space-y-2">
          <li>
            <Link href="/user/settings" className="flex items-center px-3 py-2 rounded hover:bg-gray-100">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </li>
          <li>
            <Link href="/logout" className="flex items-center px-3 py-2 rounded hover:bg-gray-100">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
