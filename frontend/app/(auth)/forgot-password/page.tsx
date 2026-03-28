"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"

type State = "idle" | "loading" | "success" | "error"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg((data as { message?: string }).message ?? "Gửi yêu cầu thất bại. Vui lòng thử lại.")
        setState("error")
        return
      }

      setState("success")
    } catch {
      setErrorMsg("Không thể kết nối đến server. Vui lòng thử lại.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Kiểm tra email của bạn</h1>
        <p className="text-muted-foreground mb-6">
          Nếu địa chỉ <span className="font-medium text-foreground">{email}</span> tồn tại trong hệ thống,
          bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
        </p>
        <Link href="/login" className="text-primary hover:underline font-medium text-sm">
          ← Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-2">Quên mật khẩu?</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Nhập email đã đăng ký và chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
      </p>

      {state === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full" disabled={state === "loading"}>
          {state === "loading" ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
        </Button>
      </form>

      <p className="text-center mt-6">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}
