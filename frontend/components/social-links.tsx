import { Facebook, Twitter, Youtube } from "lucide-react"
import Link from "next/link"

export default function SocialLinks() {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm mr-2">Follow us:</p>
      <Link href="#" className="p-1 hover:text-primary">
        <Facebook className="h-5 w-5" />
      </Link>
      <Link href="#" className="p-1 hover:text-primary">
        <Twitter className="h-5 w-5" />
      </Link>
      <Link href="#" className="p-1 hover:text-primary">
        <Youtube className="h-5 w-5" />
      </Link>
    </div>
  )
}
