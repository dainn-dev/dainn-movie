import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  UserIcon,
  Heart,
  Star,
  Film,
  Settings,
  LogOut,
  Users,
  MessageCircle,
  Bookmark,
  History,
  Bell,
  ShoppingBag,
  Wallet,
} from "lucide-react"

export type UserSidebarActive =
  | "profile"
  | "favorites"
  | "rated"
  | "friends"
  | "messages"
  | "watchlist"
  | "history"
  | "notifications"
  | "purchases"
  | "sales"

interface UserSidebarProps {
  activeItem?: UserSidebarActive
}

function itemClass(active: boolean) {
  return `flex items-center px-3 py-2 rounded ${
    active ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
  }`
}

export default function UserSidebar({ activeItem = "profile" }: UserSidebarProps) {
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
            <Link href="/user/profile" className={itemClass(activeItem === "profile")}>
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </li>
          <li>
            <Link href="/user/favorites/grid" className={itemClass(activeItem === "favorites")}>
              <Heart className="h-4 w-4 mr-2" />
              Favorite movies
            </Link>
          </li>
          <li>
            <Link href="/user/rated" className={itemClass(activeItem === "rated")}>
              <Star className="h-4 w-4 mr-2" />
              Rated movies
            </Link>
          </li>
          <li>
            <Link href="/user/my-movies" className={itemClass(false)}>
              <Film className="h-4 w-4 mr-2" />
              My movies
            </Link>
          </li>
          <li>
            <Link href="/user/purchases" className={itemClass(activeItem === "purchases")}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Đơn mua
            </Link>
          </li>
          <li>
            <Link href="/user/sales" className={itemClass(activeItem === "sales")}>
              <Wallet className="h-4 w-4 mr-2" />
              Doanh thu bán
            </Link>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Xã hội (M5)</h4>
        <ul className="space-y-2">
          <li>
            <Link href="/user/friends" className={itemClass(activeItem === "friends")}>
              <Users className="h-4 w-4 mr-2" />
              Bạn bè
            </Link>
          </li>
          <li>
            <Link href="/user/messages" className={itemClass(activeItem === "messages")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Tin nhắn
            </Link>
          </li>
          <li>
            <Link href="/user/notifications" className={itemClass(activeItem === "notifications")}>
              <Bell className="h-4 w-4 mr-2" />
              Thông báo
            </Link>
          </li>
          <li>
            <Link href="/watchlist" className={itemClass(activeItem === "watchlist")}>
              <Bookmark className="h-4 w-4 mr-2" />
              Xem sau
            </Link>
          </li>
          <li>
            <Link href="/user/watch-history" className={itemClass(activeItem === "history")}>
              <History className="h-4 w-4 mr-2" />
              Lịch sử xem
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
