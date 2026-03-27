# Project Facts — Movie Social Platform

_Stable facts. Chỉ update khi project thay đổi căn bản._

## Description

Nền tảng xã hội xem phim do cộng đồng đóng góp (user-generated content). Users có thể:
- Upload phim lên platform
- Xem phim online (nhiều chapter, nhiều server quality)
- Rate và review phim
- Xem profile celebrity, filmography
- Kết bạn với users khác
- Chat real-time với bạn bè
- Quản lý danh sách phim yêu thích, phim đã xem

Khác với Netflix/Disney+ (content do chủ site), platform này giống mô hình Wikipedia cho phim — community-driven.

## Tech Stack

### Frontend (hiện tại)
| Thư viện | Version | Vai trò |
|---|---|---|
| Next.js | 15.2.4 | Framework (App Router) |
| React | 18.2.0 | UI library |
| TypeScript | 5 | Type safety (strict mode) |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | latest | UI component library |
| Radix UI | various | Headless UI primitives |
| lucide-react | 0.454.0 | Icons |
| embla-carousel-react | 8.5.1 | Carousel/slider |
| react-hook-form | 7.54.1 | Form management |
| zod | 3.24.1 | Schema validation |
| recharts | 2.15.0 | Charts (admin dashboard) |
| date-fns | 3.6.0 | Date utilities |
| sonner | 1.7.1 | Toast notifications |
| next-themes | 0.4.4 | Dark/light mode |

### Backend (kế hoạch — chưa build)
| Thành phần | Công nghệ | Lý do chọn |
|---|---|---|
| API Framework | ASP.NET Core 8 Minimal API | Performance tốt trên ARM, team quen Java/.NET |
| Database | PostgreSQL | Mạnh, free, chạy tốt trên Pi 5 |
| Cache | Redis | Session, rate limiting, reduce DB load |
| Real-time | SignalR (built-in .NET) | Chat + notifications |
| Video Storage | Cloudflare R2 | S3-compatible, free 10GB, không bandwidth cost |
| CDN | Cloudflare (free) | Cache + DDoS protection + video delivery |
| Video Transcoding | FFmpeg (background job) | Convert uploaded video sang multiple qualities |
| Job Queue | Hangfire | Async transcoding, email, notifications |
| Auth | JWT + Refresh Token | Stateless, scalable |
| Container | Docker + Docker Compose | Easy deploy trên Pi 5 |

## Architecture

### Hybrid Pi 5 + Cloudflare

```
Internet User
     │
     ▼
Cloudflare (CDN + DDoS protection)
     │
     ├── Static assets (cached tại edge)
     │
     ├── Video streams → Cloudflare R2 (KHÔNG qua Pi 5)
     │
     └── API requests → Raspberry Pi 5
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
               Next.js   ASP.NET    FFmpeg
               (Frontend)  Core 8   (Transcoding)
                           (API)
                    ▼         ▼
                 PostgreSQL  Redis
                 (Primary DB) (Cache)
```

### Capacity (self-hosted Pi 5)
- API (non-video): ~5,000–10,000 concurrent users
- Video streaming: offload 100% sang Cloudflare R2 → Pi không tốn bandwidth
- Scale path: thêm Pi 5 nodes khi cần, dùng PostgreSQL replication

## Database Schema (kế hoạch)

### Core tables
```
users           — id, username, email, password_hash, avatar_url, created_at
movies          — id, title, description, poster_url, year, runtime, mpaa_rating, uploaded_by, status
genres          — id, name
movie_genres    — movie_id, genre_id
celebrities     — id, name, role, bio, image_url, date_of_birth, country
movie_cast      — movie_id, celebrity_id, character_name, role_type
chapters        — id, movie_id, title, duration, order
video_sources   — id, chapter_id, quality (SD/HD/4K), cloudflare_r2_key, server_name
reviews         — id, movie_id, user_id, rating (1-10), title, body, created_at
ratings         — id, movie_id, user_id, score (1-10), created_at (unique movie+user)
favorites       — id, user_id, movie_id, created_at
friendships     — id, requester_id, receiver_id, status (pending/accepted/blocked)
messages        — id, sender_id, receiver_id, body, read_at, created_at
news            — id, title, body, author_id, thumbnail_url, created_at
```

## API Overview (kế hoạch)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login` → JWT + refresh token
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Movies
- `GET /api/movies?category=popular&page=1`
- `GET /api/movies/{id}`
- `POST /api/movies` (upload metadata + get presigned URL)
- `PUT /api/movies/{id}`

### Video
- `GET /api/movies/{id}/chapters`
- `POST /api/videos/presigned-url` → Cloudflare R2 presigned upload URL
- `POST /api/videos/transcode` → trigger FFmpeg job

### Social
- `GET /api/users/{id}/friends`
- `POST /api/friends/request`
- `PUT /api/friends/{id}/accept`
- `GET /api/messages/{friendId}`
- `WebSocket /hubs/chat` (SignalR)

### Reviews
- `GET /api/movies/{id}/reviews`
- `POST /api/movies/{id}/reviews`
- `POST /api/movies/{id}/rate`

## Key Components

| File | Vai trò |
|---|---|
| `app/layout.tsx` | Root layout — fonts (Nunito + Dosis), metadata, Providers |
| `app/(main)/layout.tsx` | Main layout — Header + Footer |
| `components/providers.tsx` | Root providers — hiện chỉ wrap ChatSystem |
| `components/chat-system.tsx` | Floating chat widget (800×500px) |
| `components/movie-grid.tsx` | Grid cards theo category |
| `components/movie-slider.tsx` | Hero carousel (dark bg) |
| `components/header.tsx` | Nav + search + auth buttons |
| `app/admin/layout.tsx` | Admin layout với AdminSidebar |
| `tailwind.config.ts` | Colors (primary #dd003f), fonts (nunito/dosis), animations |

## Infrastructure

- **Deployment:** Self-hosted Raspberry Pi 5 (8GB recommended)
- **CDN:** Cloudflare (free tier) — bắt buộc cho video delivery
- **Video Storage:** Cloudflare R2 (free 10GB) hoặc Backblaze B2 (~$6/TB/month)
- **Container:** Docker + Docker Compose
- **Domain:** Cloudflare DNS + Cloudflare Tunnel (thay vì mở port trực tiếp)

## Conventions

- Named export cho components: `export function Header()`
- Default export cho pages: `export default function Home()`
- `"use client"` bắt buộc cho bất kỳ component nào dùng useState/useEffect/event handlers
- Import alias `@/` thay relative paths
- Brand color `#dd003f` = `bg-primary` / `text-primary` / `.redbtn` CSS class
- Heading font: `font-dosis` (Dosis) — tự động áp dụng cho h1-h6 qua globals.css
- Body font: Nunito — tự động áp dụng cho body
- Mock data → sẽ được replace bằng API calls khi backend sẵn sàng
