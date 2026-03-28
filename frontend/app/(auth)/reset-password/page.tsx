"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type State = "idle" | "loading" | "success" | "error"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center text-muted-foreground text-sm">
          Đang tải...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  // Missing token — show error immediately
  if (!token) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold mb-2">Link không hợp lệ</h1>
        <p className="text-muted-foreground mb-6">
          Link đặt lại mật khẩu này không hợp lệ hoặc đã hết hạn.
        </p>
        <Link href="/forgot-password" className="text-primary hover:underline font-medium text-sm">
          Yêu cầu link mới
        </Link>
      </div>
    )
  }

  if (state === "success") {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Mật khẩu đã được cập nhật</h1>
        <p className="text-muted-foreground mb-6">
          Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
        </p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Đăng nhập
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu nhập lại không khớp.")
      setState("error")
      return
    }

    setState("loading")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrorMsg((data as { message?: string }).message ?? "Đặt lại mật khẩu thất bại.")
        setState("error")
        return
      }

      setState("success")
    } catch {
      setErrorMsg("Không thể kết nối đến server. Vui lòng thử lại.")
      setState("error")
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-2">Đặt mật khẩu mới</h1>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số.
      </p>

      {state === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={state === "loading"}>
          {state === "loading" ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
        </Button>
      </form>
    </div>
  )
}
