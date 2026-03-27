# Movie Social Platform — Memory

**Stack:** Next.js 15 App Router + TypeScript | **Backend (planned):** ASP.NET Core 8 + PostgreSQL + Redis
**Video:** Cloudflare R2 + CDN | **Deploy:** Raspberry Pi 5 + Cloudflare
**Users:** Cộng đồng xem phim — upload, xem, review, kết bạn, chat

**Luôn nhớ:**
- Brand color `#dd003f` = `bg-primary` / `text-primary`
- Video KHÔNG đi qua Pi 5 — dùng presigned URL → Cloudflare R2
- Tất cả data hiện là mock → cần migrate sang API khi backend sẵn sàng
- `"use client"` cho bất kỳ component nào dùng hooks/events

**Mode:** DEV AGENT

---

## Current State

- **Status:** Frontend UI hoàn thiện (mock data), backend chưa xây dựng
- **Active branch:** main
- **Last task:** Khởi tạo project config bởi Blueberry Sensei (2026-03-27)
- **Next priority:** Thiết kế backend ASP.NET Core 8 + database schema

## Key Components

| File | Vai trò |
|---|---|
| `app/(main)/page.tsx` | Homepage — slider + grid + news + celebrities |
| `app/(main)/movies/[id]/page.tsx` | Movie detail — chapters, servers, reviews, cast |
| `app/(main)/user/profile/page.tsx` | User profile — settings, friends, privacy |
| `components/chat-system.tsx` | Floating chat widget — real-time messaging (mock) |
| `components/movie-grid.tsx` | Movie card grid — cần kết nối API |
| `app/admin/dashboard/page.tsx` | Admin dashboard |

## Phần đang còn Mock (cần API)

- `components/movie-grid.tsx` — hardcode movies object
- `components/movie-slider.tsx` — hardcode sliderMovies array
- `components/chat-system.tsx` — hardcode mockFriends + mockConversations
- `app/(main)/movies/[id]/page.tsx` — hardcode movie object
- `app/(main)/celebrities/[id]/page.tsx` — hardcode celebrity object
- `app/(main)/user/profile/page.tsx` — hardcode mockFriends
- `components/login-form.tsx` — chỉ console.log, chưa có auth

## In Progress

(none)

## Recent Decisions

Xem `.claude/memory/decisions.md`

---

_Keep this file under 200 lines. Archive old context with compress-context skill._
