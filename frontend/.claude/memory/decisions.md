# Architectural Decisions

_Thêm decisions vào đây khi chúng được đưa ra._

---

## Decision: Next.js App Router

**Date:** 2026-03-27
**Decision:** Dùng Next.js 15 App Router thay vì Pages Router
**Reason:** App Router là standard hiện tại của Next.js, hỗ trợ React Server Components, streaming, layouts lồng nhau — tốt hơn cho performance và DX
**Alternatives considered:** Pages Router (cũ hơn, ít features hơn)

---

## Decision: shadcn/ui làm UI component library

**Date:** 2026-03-27
**Decision:** Dùng shadcn/ui (Radix UI + Tailwind) thay vì MUI, Chakra UI, hay Ant Design
**Reason:** Copy-paste approach — components nằm trong codebase, có thể customize hoàn toàn, không bị phụ thuộc version của external package. Phù hợp với Tailwind CSS workflow.
**Alternatives considered:** MUI (too opinionated, harder to customize), Ant Design (heavy, không Tailwind-native)

---

## Decision: ASP.NET Core 8 cho Backend

**Date:** 2026-03-27
**Decision:** Dùng ASP.NET Core 8 Minimal API thay vì Spring Boot hay Node.js Express
**Reason:**
1. Team quen với Java/.NET ecosystem
2. ASP.NET Core có performance xuất sắc trên ARM (Raspberry Pi 5)
3. Memory footprint thấp hơn Spring Boot
4. SignalR built-in cho real-time chat
5. Hangfire cho background jobs (transcoding)
**Alternatives considered:** Spring Boot (team familiar nhưng heavy hơn trên ARM), Node.js Fastify (performance tốt nhưng team không quen)

---

## Decision: PostgreSQL làm primary database

**Date:** 2026-03-27
**Decision:** Dùng PostgreSQL thay vì MySQL hay MongoDB
**Reason:** Data của platform có nhiều relationships (movies, genres, cast, reviews, friendships) — relational DB phù hợp hơn. PostgreSQL mạnh hơn MySQL về features (JSON, full-text search, window functions). Free, open source, chạy tốt trên Pi 5.
**Alternatives considered:** MySQL (ít features hơn), MongoDB (overkill, schema-less không phù hợp khi data có structure rõ ràng)

---

## Decision: Redis cho caching và session

**Date:** 2026-03-27
**Decision:** Dùng Redis cho caching, rate limiting, và session storage
**Reason:** In-memory, cực nhanh, giảm tải cho PostgreSQL. Cần thiết cho rate limiting upload và API calls. ASP.NET Core có Redis integration tốt.
**Alternatives considered:** In-memory cache (không cluster-safe, mất data khi restart)

---

## Decision: Cloudflare R2 cho video storage

**Date:** 2026-03-27
**Decision:** Dùng Cloudflare R2 thay vì lưu video trực tiếp trên Pi 5
**Reason:**
1. Pi 5 không đủ băng thông upload cho video streaming (Gigabit ethernet ≈ 125MB/s lý thuyết, thực tế ISP upload thấp hơn nhiều)
2. R2 free 10GB, zero egress fees (không tính phí bandwidth ra)
3. Cloudflare CDN phân phối video đến users từ edge nodes toàn cầu
4. Pi 5 chỉ xử lý presigned URLs, không touch video data
**Alternatives considered:** Lưu trên Pi + external HDD (bottleneck bandwidth), AWS S3 (egress fees đắt), Backblaze B2 (rẻ hơn S3 nhưng không có CDN tích hợp)

---

## Decision: Hybrid architecture — Pi 5 + Cloudflare

**Date:** 2026-03-27
**Decision:** Pi 5 xử lý API + DB + Auth. Cloudflare xử lý CDN + video streaming + DDoS protection
**Reason:** Giải quyết bottleneck bandwidth của self-hosted server. Pi 5 có thể phục vụ 5,000–10,000 concurrent API users khi video đã offload sang CDN. Cloudflare Tunnel thay thế việc mở port trực tiếp (bảo mật hơn).
**Alternatives considered:** Pure cloud (đắt tiền), pure self-hosted (bị nghẽn bandwidth video)

---

## Decision: SignalR cho real-time chat

**Date:** 2026-03-27
**Decision:** Dùng SignalR (ASP.NET Core built-in) cho real-time features
**Reason:** Built-in với ASP.NET Core, hỗ trợ WebSocket + fallback, có thể scale với Redis backplane khi cần. Không cần thêm service riêng biệt.
**Alternatives considered:** Socket.io (Node.js, không phù hợp với .NET backend), Pusher (paid service)

---

## Decision: Hangfire cho background jobs

**Date:** 2026-03-27
**Decision:** Dùng Hangfire thay vì RabbitMQ cho transcoding jobs
**Reason:** Đơn giản hơn RabbitMQ, tích hợp dễ với ASP.NET Core, có dashboard UI để monitor jobs, dùng PostgreSQL làm storage (không cần thêm service). Phù hợp với quy mô hiện tại.
**Alternatives considered:** RabbitMQ (powerful hơn nhưng phức tạp hơn, cần thêm service riêng)

---

## Decision: Docker + Docker Compose cho deployment

**Date:** 2026-03-27
**Decision:** Containerize toàn bộ stack với Docker + Docker Compose trên Pi 5
**Reason:** Dễ deploy, restart tự động, isolate services, dễ update từng service riêng lẻ. Docker hỗ trợ ARM64 tốt.
**Alternatives considered:** Chạy trực tiếp trên OS (khó manage, dependency conflicts)

---

## Decision: JWT + Refresh Token cho authentication

**Date:** 2026-03-27
**Decision:** Dùng JWT access token (15 phút) + Refresh token (30 ngày) lưu trong Redis
**Reason:** Stateless, không cần session server, scalable. Access token ngắn hạn bảo mật hơn. Refresh token trong Redis có thể revoke khi cần.
**Alternatives considered:** Session-based auth (stateful, khó scale), Supabase Auth (external dependency)
