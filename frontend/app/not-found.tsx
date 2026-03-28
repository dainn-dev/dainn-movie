"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Preloader from "@/components/preloader"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"

export default function NotFound() {
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <Preloader />
  }

  return (
    <>
      {loginOpen && <LoginForm onClose={() => setLoginOpen(false)} />}
      {signupOpen && <SignupForm onClose={() => setSignupOpen(false)} />}

      <div className="page-single">
        <div className="container max-w-md mx-auto text-center">
          <Link href="/">
            <Image
              className="md-logo mx-auto"
              src="/images/logo1.png"
              alt="DMovie Logo"
              width={119}
              height={58}
              priority
            />
          </Link>

          <Image src="/images/err-img.png" alt="404 Error" width={300} height={300} className="mx-auto my-6" priority />

          <h1 className="text-4xl font-bold mb-6">Page not found</h1>

          <Link href="/" className="redbtn">
            go home
          </Link>
        </div>
      </div>
    </>
  )
}
