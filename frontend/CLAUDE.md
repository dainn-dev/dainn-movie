# Movie Social Platform

Nền tảng xã hội xem phim do cộng đồng đóng góp — users upload phim, xem online, rate/review, kết bạn và chat thời gian thực. Frontend Next.js 15 + Backend ASP.NET Core 8 (đang được xây dựng), self-hosted trên Raspberry Pi 5 + Cloudflare CDN.

---

## Project Context

| | |
|---|---|
| **Frontend** | Next.js 15.2.4 (App Router) · TypeScript 5 strict · shadcn/ui · Tailwind CSS 3 |
| **Backend (planned)** | ASP.NET Core 8 Minimal API · PostgreSQL · Redis · SignalR |
| **Video** | Cloudflare R2 (storage) + Cloudflare CDN (streaming) |
| **Auth** | JWT + Refresh Token |
| **Queue** | Hangfire (async transcoding jobs) |
| **Container** | Docker + Docker Compose |
| **Deployment** | Raspberry Pi 5 (API + DB) + Cloudflare (video/CDN) |
| **Scale target** | 1M registered users · ~300 concurrent video streams |
| **Users** | Cộng đồng xem phim — upload, xem, review, kết bạn |

**Luôn nhớ:**
- Brand color: `#dd003f` (đỏ) — dùng `.redbtn` CSS class hoặc `bg-primary`
- Font: Nunito (body) + Dosis (headings) — đã config trong `tailwind.config.ts`
- Path alias: `@/*` → project root
- Tất cả data hiện tại là **mock/hardcoded** trong component files — chưa có API thật
- Pages dùng **default export**, components lớn dùng **named export**
- Interactive components phải có `"use client"` directive
- Video **không** đi qua Pi 5 — Pi chỉ xử lý metadata + presigned URLs, video stream trực tiếp từ Cloudflare R2
- Pi 5 có thể xử lý ~5,000–10,000 concurrent API users khi video đã offload sang CDN

---

## Làm việc với Claude (DEV AGENT mode)

### Bước 1 — Hiểu Task
- Đọc CLAUDE.md + `.claude/memory/MEMORY.md` + docs liên quan
- Nếu chưa rõ: hỏi từng câu một, chờ trả lời (max 3 câu)
- Dùng quick options khi có thể: "Option 1: ... Option 2: ... Option 3: Khác"

### Bước 2 — Branch
- Kiểm tra branch hiện tại: `git branch --show-current`
- **Cảnh báo** nếu đang ở feat/fix branch khác (có thể quên chưa checkout về main)
- Hỏi:
  - Option 1: Tạo branch mới `feat/<slug>` hoặc `fix/<slug>`
  - Option 2: Tiếp tục trên branch hiện tại
  - Option 3: Khác

### Bước 3 — Plan & Confirm

**Task nhỏ** (1-3 file, ít impact):
> "Tôi sẽ [mô tả ngắn]. Được chưa?"
Chờ confirm mới làm.

**Task lớn** (nhiều file, nhiều component):
Build plan đầy đủ:
- File nào tạo/sửa
- Test nào viết
- Dependency nào cần
> "Đây là plan: [plan]. Confirm để bắt đầu?"
Chờ confirm mới làm.

### Bước 4 — Implement

Khi code, luôn kiểm tra:
- **Security:** Input đã validate chưa? Có lỗ hổng injection, auth bypass không?
- **Cluster-safe:** Có dùng in-memory state không? Nếu có → chuyển qua Redis
- **Performance:** Có N+1 query không? Cần cache không? Batch được không?
- **Pattern nhất quán:** Có theo đúng pattern của codebase không?
- **Side effects:** Thay đổi này có break feature/logic khác không?
- **Video flow:** Component nào liên quan video phải dùng presigned URL từ API, không hardcode link

### Bước 5 — Test & Verify
- Chạy `npm run build` để check TypeScript errors
- Kiểm tra không có lỗi compile
- Nếu có UI thay đổi → dùng `.claude/skills/ui-review.md`

---

## Project Structure

```
app/
  (main)/                   # Public site — Header + Footer layout
    layout.tsx              # Main layout (Header + Footer)
    page.tsx                # Homepage: slider + grid + news + celebrities + trailers
    movies/[id]/page.tsx    # Movie detail: chapters, server, reviews, cast, media
    celebrities/[id]/page.tsx  # Celebrity profile: bio, filmography, media
    news/[id]/page.tsx      # News/blog article detail
    user/
      favorites/grid/       # Danh sách phim yêu thích
      profile/page.tsx      # Profile: settings, friends, privacy
  admin/
    layout.tsx              # Admin layout với AdminSidebar
    dashboard/page.tsx      # Admin dashboard (charts, stats)
  coming-soon/page.tsx      # Coming soon với countdown timer
  timeline/page.tsx         # Activity timeline
  user/
    my-movies/page.tsx      # Phim do user upload
    rated/page.tsx          # Phim user đã rate
  globals.css               # Global styles + CSS variables + brand classes (.redbtn, .preloader...)
  layout.tsx                # Root layout (fonts, metadata, Providers)
  not-found.tsx             # 404 page

components/
  ui/                       # shadcn/ui components (đầy đủ bộ Radix UI)
  header.tsx                # Site header — nav dropdowns, search, login/signup
  footer.tsx                # Site footer
  movie-slider.tsx          # Embla carousel hero (dark background)
  movie-grid.tsx            # Movie card grid — hiển thị theo category
  chat-system.tsx           # Floating chat widget — friends list + messaging
  providers.tsx             # Root providers (wrap ChatSystem)
  admin-sidebar.tsx         # Admin navigation sidebar
  featured-celebrities.tsx  # Celebrity section on homepage
  latest-news.tsx           # News section on homepage
  trailer-section.tsx       # Trailer section on homepage
  login-dialog.tsx          # Login modal (dùng shadcn Dialog)
  login-form.tsx            # Login form (username + password)
  signup-dialog.tsx         # Signup modal
  signup-form.tsx           # Signup form
  friend-list.tsx           # Danh sách bạn bè (compact hoặc full)
  friend-button.tsx         # Add/remove friend button
  privacy-selector.tsx      # Privacy settings selector
  preloader.tsx             # Loading screen
  countdown.tsx             # Countdown timer (coming-soon page)
  social-links.tsx          # Social media links

docs/
  architecture.md           # System architecture (Pi 5 + Cloudflare hybrid)
  api-overview.md           # API endpoints (sẽ update khi backend sẵn sàng)

.claude/
  memory/
    MEMORY.md               # Project state hiện tại
    project.md              # Stable facts về project
    decisions.md            # Architectural decisions
  skills/
    testing.md              # Test workflow
    ui-review.md            # UI review process
    parallel-agents.md      # Parallel agents
    compress-context.md     # Context compression
    nextjs-patterns.md      # Next.js App Router patterns
    video-upload-workflow.md # Video upload + transcoding flow
    backend-api-workflow.md  # ASP.NET Core API workflow
```

---

## Key Commands

| Command | Mô tả |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Build production + TypeScript check |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |

---

## Skills

| Skill | Khi nào dùng |
|---|---|
| `.claude/skills/testing.md` | Chạy tests, viết tests |
| `.claude/skills/ui-review.md` | Sau khi thay đổi UI |
| `.claude/skills/parallel-agents.md` | Task lớn có nhiều phần độc lập |
| `.claude/skills/compress-context.md` | Context quá dài (50+ messages) |
| `.claude/skills/nextjs-patterns.md` | Làm việc với Next.js App Router |
| `.claude/skills/video-upload-workflow.md` | Feature liên quan upload/stream video |
| `.claude/skills/backend-api-workflow.md` | Build ASP.NET Core API endpoints |

---

## Memory System

Đọc trước khi bắt đầu task:
- `.claude/memory/MEMORY.md` — project state hiện tại (< 200 lines)
- `.claude/memory/project.md` — stable facts về project
- `.claude/memory/decisions.md` — architectural decisions đã được đưa ra

Cập nhật sau khi hoàn thành task:
- Update `MEMORY.md` nếu project state thay đổi
- Thêm vào `decisions.md` nếu có architectural decision mới

---

## Testing

- Framework: Chưa setup (Next.js project chưa có test files)
- Khi setup: dùng **Vitest** + **React Testing Library** cho frontend
- Build check: `npm run build` (TypeScript strict mode)
- Pattern: test files đặt cạnh component — `component.test.tsx`

---

## Git & GitHub

- Branches: `feat/<task>`, `fix/<task>`, `chore/<task>` (kebab-case, max 4 từ)
- Commits: nhỏ, thường xuyên, descriptive
- PR: tạo khi task xong, bao gồm change summary

---

## Code Conventions

- **Components:** Named export cho components lớn (`export function Header()`), default export cho pages
- **Client components:** Luôn thêm `"use client"` ở đầu file nếu dùng hooks hoặc event handlers
- **Import alias:** Dùng `@/` thay vì relative path (e.g., `@/components/ui/button`)
- **Styling:** Tailwind classes + shadcn/ui components — không viết CSS inline
- **Mock data:** Hiện tại hardcode trong component files — sẽ migrate sang API calls khi backend sẵn sàng
- **Colors:** Dùng `text-primary`, `bg-primary` (= `#dd003f`) cho brand color
- **Typography:** `font-dosis` cho headings, body tự động dùng Nunito

---

## Context Management

Khi context quá dài (50+ messages):
Run compress-context skill → summarize → archive → rewrite MEMORY.md
