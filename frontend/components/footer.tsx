import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1 */}
          <div>
            <Link href="/">
              <Image
                src="/placeholder.svg?height=58&width=119"
                alt="DMovie"
                width={119}
                height={58}
                className="mb-4"
              />
            </Link>
            <p className="text-sm mb-2">
              5th Avenue st, manhattan
              <br />
              New York, NY 10001
            </p>
            <p className="text-sm">
              Call us:{" "}
              <a href="tel:+01202342678" className="hover:text-primary">
                (+01) 202 342 6789
              </a>
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blockbuster" className="hover:text-primary">
                  Blockbuster
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/forums" className="hover:text-primary">
                  Forums
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-primary">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-primary">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-primary">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-primary">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-primary">
                  User Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe to our newsletter system now to get latest news from us.</p>
            <div className="space-y-2">
              <Input type="email" placeholder="Enter your email..." className="bg-gray-800 border-gray-700" />
              <Button className="w-full">
                Subscribe now <ChevronUp className="ml-2 h-4 w-4 rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2026 DMovie. All rights reserved.</p>
          <div className="flex items-center mt-2 md:mt-0">
            <a href="#" className="text-sm text-gray-400 flex items-center hover:text-primary">
              Back to top <ChevronUp className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
