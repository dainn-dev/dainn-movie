# Architecture — Movie Social Platform

## Overview

Nền tảng xã hội xem phim do cộng đồng đóng góp. Users upload phim, xem online, rate/review, kết bạn và chat real-time. Kiến trúc hybrid: Raspberry Pi 5 xử lý API + DB, Cloudflare xử lý CDN + video streaming — giải quyết bottleneck bandwidth của self-hosted server.

Target: **1 triệu registered users**, ~**300 concurrent video streams**, ~**5,000–10,000 concurrent API users**.

---

## System Diagram

```
                         INTERNET
                             │
                    ┌────────▼────────┐
                    │   Cloudflare    │
                    │  (CDN + DDoS)   │
                    │  Tunnel + DNS   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    Static assets      Video streams    API requests
    (cached at edge)   (from R2/CDN)    (proxied)
                                             │
                                    ┌────────▼────────┐
                                    │  Raspberry Pi 5  │
                                    │  (8GB RAM, ARM)  │
                                    └────────┬────────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          │                  │                  │
                    ┌─────▼─────┐    ┌───────▼──────┐  ┌──────▼──────┐
                    │  Next.js  │    │ ASP.NET Core │  │   FFmpeg    │
                    │ (Frontend)│    │  8 Minimal   │  │ (Transcode) │
                    │  :3000    │    │  API :5000   │  │  Hangfire   │
                    └───────────┘    └───────┬──────┘  └─────────────┘
                                             │
                                ┌────────────┼────────────┐
                                │            │            │
                          ┌─────▼──┐   ┌────▼───┐  ┌────▼────────┐
                          │Postgres│   │ Redis  │  │ SignalR Hub │
                          │  :5432 │   │ :6379  │  │  (Chat/WS)  │
                          └────────┘   └────────┘  └─────────────┘

              ┌──────────────────────────────────────────────────┐
              │              Cloudflare R2                        │
              │  videos/{movie_id}/{chapter_id}/{quality}.mp4     │
              │  (Presigned URLs — upload/stream bypass Pi 5)     │
              └──────────────────────────────────────────────────┘
```

---

## Components

### Frontend — Next.js 15 (App Router)

- **Location:** `e:\Projects\movie-next\` (repo hiện tại)
- **Port:** 3000
- **Role:** UI layer — render pages, gọi ASP.NET Core API, stream video từ Cloudflare R2

**Key routes:**
- `app/(main)/` — Public site với Header + Footer
- `app/admin/` — Admin dashboard
- `app/coming-soon/` — Pre-launch page

**State:** Hiện tại toàn bộ data là mock/hardcoded — cần migrate sang API calls

---

### Backend — ASP.NET Core 8 Minimal API

- **Location:** `../MovieSocial.Api/` (sẽ tạo)
- **Port:** 5000
- **Role:** Business logic, auth, database access, tạo presigned URLs cho R2

**Các module chính:**
- Auth (JWT + Refresh Token)
- Movies CRUD + metadata
- Video (presigned URL generation)
- Reviews + Ratings
- Friends + Friend Requests
- Messages (lưu lịch sử chat)
- Admin APIs

---

### Database — PostgreSQL 16

- **Port:** 5432
- **Role:** Primary data store cho tất cả relational data

**Schema tóm tắt:**
```sql
users, movies, genres, movie_genres
celebrities, movie_cast
chapters, video_sources       -- video metadata (R2 keys)
reviews, ratings, favorites
friendships, messages
news, tags
```

---

### Cache — Redis 7

- **Port:** 6379
- **Role:** Session cache, API response cache, rate limiting, SignalR backplane

**Dùng cho:**
- JWT refresh tokens (có thể revoke)
- Movie list cache (giảm DB queries)
- Rate limiting upload (max 3 videos/user/day)
- Online users list (for chat)

---

### Real-time — SignalR (built-in .NET)

- **Hub:** `/hubs/chat`
- **Role:** Real-time chat giữa users
- **Backplane:** Redis (scale nếu cần nhiều instances)

---

### Video Storage — Cloudflare R2

- **Role:** Lưu trữ và phân phối video files
- **Key structure:** `videos/{movieId}/{chapterId}/{quality}.mp4`
- **Upload:** Browser → R2 trực tiếp (presigned PUT URL, TTL 15 phút)
- **Stream:** Browser → Cloudflare CDN → R2 (presigned GET URL hoặc public)
- **Cost:** Free 10GB, zero egress fees

---

### Job Queue — Hangfire

- **Storage:** PostgreSQL (cùng DB)
- **Dashboard:** `/hangfire` (admin only)
- **Jobs:**
  - `TranscodeJob` — FFmpeg convert video sang SD/HD/4K
  - `ThumbnailJob` — Extract poster frame từ video
  - `NotificationJob` — Email/push notifications

---

### Containerization — Docker Compose

```yaml
services: [next-frontend, aspnet-api, postgres, redis, hangfire-worker]
```

Tất cả chạy trong Docker containers trên Pi 5. Cloudflare Tunnel thay thế việc mở port trực tiếp.

---

## Data Flow

### User xem phim

```
1. User mở /movies/123
2. Next.js fetch: GET /api/movies/123 → ASP.NET Core
3. ASP.NET Core query PostgreSQL → trả về movie metadata
4. User chọn chapter + quality → click "Watch Now"
5. Next.js fetch: GET /api/chapters/456/stream-url
6. ASP.NET Core tạo R2 presigned URL (TTL 1h)
7. Browser stream video trực tiếp từ Cloudflare R2
   (Pi 5 không tham gia bước 7)
```

### User upload phim

```
1. User fill form + chọn video file
2. Next.js POST /api/videos/presigned-url → nhận R2 presigned PUT URL
3. Browser upload file thẳng lên R2 (hiển thị progress bar)
4. Next.js POST /api/videos/confirm-upload
5. Hangfire enqueue TranscodeJob
6. FFmpeg (trên Pi) download từ R2, transcode, upload versions về R2
7. DB update: video_sources với các quality versions
8. User nhận notification: "Video đã sẵn sàng"
```

### Chat real-time

```
1. User A mở chat với User B
2. Browser kết nối WebSocket: /hubs/chat (SignalR)
3. User A gửi message → SignalR Hub
4. Hub lưu message vào PostgreSQL (messages table)
5. Hub push message đến User B qua WebSocket
6. Nếu User B offline → message được lưu, hiển thị khi online
```

---

## Environment Variables

### Frontend (Next.js)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_CF_R2_URL=https://pub-xxx.r2.dev
NEXT_PUBLIC_SIGNALR_URL=https://api.yourdomain.com/hubs/chat
```

### Backend (ASP.NET Core)
```env
ConnectionStrings__Default=Host=postgres;Database=moviesocial;Username=...;Password=...
Redis__Connection=redis:6379
Jwt__Secret=<256-bit-secret>
Jwt__Issuer=moviesocial-api
Jwt__AccessTokenExpiry=15    # minutes
Jwt__RefreshTokenExpiry=43200 # 30 days in minutes
Cloudflare__R2__AccountId=...
Cloudflare__R2__AccessKeyId=...
Cloudflare__R2__SecretAccessKey=...
Cloudflare__R2__BucketName=moviesocial-videos
```

---

## Scale Path

| Phase | Users | Infrastructure |
|---|---|---|
| MVP | < 10K registered | 1x Pi 5, Cloudflare free, R2 free 10GB |
| Growth | 10K–100K | 1x Pi 5 + NVMe SSD, R2 paid, Cloudflare Pro |
| Scale | 100K–1M | 2x Pi 5 (load balance), PostgreSQL replication, Redis cluster |
| Beyond | > 1M | Migrate API sang VPS/dedicated server, giữ Pi 5 cho dev |

---

## Security Checklist

- [ ] Cloudflare Tunnel (không expose Pi IP trực tiếp)
- [ ] JWT secret >= 256 bits, rotate định kỳ
- [ ] Rate limiting: login (5/min), upload (3 videos/day/user)
- [ ] Video presigned URLs có TTL ngắn (upload: 15 phút, stream: 1 giờ)
- [ ] Input validation tất cả endpoints
- [ ] SQL injection protection qua EF Core parameterized queries
- [ ] CORS configured đúng (chỉ accept từ domain của frontend)
- [ ] Helmet headers (X-Frame-Options, CSP...)
- [ ] File type validation (chỉ accept video MIME types khi upload)
