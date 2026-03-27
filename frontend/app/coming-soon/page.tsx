"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Preloader from "@/components/preloader"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import Countdown from "@/components/countdown"

export default function ComingSoon() {
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    alert(`Thank you for subscribing with: ${email}`)
    setEmail("")
  }

  if (loading) {
    return <Preloader />
  }

  // Set countdown date to 30 days from now
  const countdownDate = new Date()
  countdownDate.setDate(countdownDate.getDate() + 30)

  return (
    <>
      {loginOpen && <LoginForm onClose={() => setLoginOpen(false)} />}
      {signupOpen && <SignupForm onClose={() => setSignupOpen(false)} />}

      <div className="page-single">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Link href="/">
                <Image
                  className="md-logo"
                  src="/images/logo1.png"
                  alt="Open Pediatrics Logo"
                  width={119}
                  height={58}
                  priority
                />
              </Link>

              <h1 className="text-4xl font-bold mb-4">Coming soon</h1>
              <p className="mb-6">We are working hard to get back to you in</p>

              <div className="coming-ct">
                <Countdown targetDate={countdownDate} />
              </div>

              <h3 className="text-xl font-bold mb-4">Notify me</h3>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  className="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="redbtn">
                  subscribe
                </button>
              </form>
            </div>

            <div className="flex items-center justify-center">
              <Image
                src="/images/cm-img.png"
                alt="Coming Soon"
                width={400}
                height={400}
                className="max-w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
