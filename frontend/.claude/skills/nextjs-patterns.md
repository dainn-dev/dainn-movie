# Next.js App Router Patterns

Dùng khi làm việc với pages, components, layouts, data fetching trong project này.

## Server vs Client Component

### Dùng Server Component (mặc định — không có "use client") khi:
- Fetch data từ API/DB
- Render static content
- Không cần interactivity

```tsx
// app/(main)/movies/[id]/page.tsx — Server Component
export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = await fetch(`${process.env.API_URL}/api/movies/${id}`).then(r => r.json())
  return <MovieDetail movie={movie} />
}
```

### Dùng Client Component ("use client") khi:
- useState, useEffect, useRef, custom hooks
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (localStorage, window)
- Real-time updates (SignalR)

```tsx
"use client"
// components/movie-grid.tsx — Client Component
import { useState } from "react"
```

## Params trong Next.js 15

**QUAN TRỌNG:** Trong Next.js 15, `params` là Promise — phải await hoặc dùng `React.use()`:

```tsx
// Server Component — dùng await
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// Client Component — dùng React.use()
"use client"
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)  // ← đã thấy trong movies/[id]/page.tsx
}
```

## Data Fetching Pattern

Khi backend sẵn sàng, replace mock data theo pattern:

```tsx
// Trước (mock)
const movies = { popular: [...] }

// Sau (API)
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies?category=popular`)
const movies = await response.json()
```

## Route Groups

- `(main)` — public site với Header + Footer (không ảnh hưởng URL)
- `admin` — admin dashboard với AdminSidebar
- Routes trong `(main)` có URL không có `/main/` prefix

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000    # Public — visible trong browser
API_URL=http://api:5000                      # Private — chỉ server-side
NEXT_PUBLIC_CF_R2_URL=https://...           # Cloudflare R2 public URL cho video
```

## Image component

Luôn dùng `next/image` thay `<img>`:
```tsx
import Image from "next/image"
<Image src={movie.poster} alt={movie.title} width={185} height={284} />
```

Thêm domain vào `next.config.ts` nếu image từ external URL:
```ts
images: { domains: ['pub-xxx.r2.dev', 'cloudflare.com'] }
```

## Shadcn/ui Components

Đã install đầy đủ trong `components/ui/`. Dùng trực tiếp:
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
```

Không cần install thêm nếu component đã có trong `components/ui/`.
