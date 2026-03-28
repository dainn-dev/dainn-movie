"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.")
      return
    }
    if (!agreedToTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          displayName: form.displayName,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? "Đăng ký thất bại. Vui lòng thử lại.")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đăng ký thành công!</h1>
        <p className="text-muted-foreground mb-4">
          Kiểm tra email để xác nhận tài khoản. Bạn sẽ được chuyển đến trang đăng nhập...
        </p>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Đăng nhập ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Tạo tài khoản</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input
            id="username"
            placeholder="vd: johndoe123"
            value={form.username}
            onChange={set("username")}
            required
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            placeholder="vd: John Doe"
            value={form.displayName}
            onChange={set("displayName")}
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={set("email")}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
            value={form.password}
            onChange={set("password")}
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
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(v) => setAgreedToTerms(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm cursor-pointer leading-snug">
            Tôi đồng ý với{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
