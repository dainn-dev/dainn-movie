# DMovie — Guideline dự án (tổng hợp)

Tài liệu **single source**. Đồng bộ với Linear: [DMovie — Guideline dự án (tổng hợp)](https://linear.app/dainndev/document/dmovie-guideline-du-an-tong-hop-6988fd494740). File trong repo: `docs/PROJECT_GUIDELINE.md` — nên cập nhật một nơi rồi mirror nơi còn lại.

## 1. Tổng quan sản phẩm

**DMovie** — nền tảng xã hội xem phim: duyệt phim/tin/diễn viên, xem online (R2/CDN), upload & transcode, đánh giá, yêu thích, bạn bè & chat, thông báo, admin duyệt phim & xử lý báo cáo.

**Stack:** Next.js App Router + ASP.NET Core 8 Minimal API + PostgreSQL + Redis + SignalR + Hangfire + Cloudflare R2.

**Monorepo:**

- `frontend/` — Next.js UI
- `backend/MovieSocial.Api/` — API, EF Core, hubs

## 2. Phiên bản & công nghệ chính

| Thành phần | Ghi chú |
|------------|---------|
| Next.js | 15.x (App Router) |
| React | 18.x |
| `@microsoft/signalr` | Chat realtime |
| .NET | 8.0 |
| EF Core + Npgsql | 8.0.11 |
| JWT Bearer | Access + refresh |
| Hangfire + PostgreSQL | Job queue |

## 3. Chạy local

### PostgreSQL & Redis

Theo `appsettings.json` (`ConnectionStrings:Postgres`, `Redis`).

### Backend

```bash
cd backend/MovieSocial.Api
dotnet ef database update
dotnet run
```

- Swagger: Development — `/swagger`
- Health: `GET /health`
- Hangfire UI: `/hangfire` — **chỉ Development**

### Frontend

```bash
cd frontend
npm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:<api-port>
npm run dev
```

## 4. Cấu hình quan trọng (API)

| Khóa | Mục đích |
|------|----------|
| `ConnectionStrings:Postgres` | EF + Hangfire |
| `ConnectionStrings:Redis` | Cache + health |
| `Jwt:Secret` | Bắt buộc, đủ dài |
| `Cors:AllowedOrigins` | Origin FE (credentials + SignalR) |
| `Cloudflare:R2:*` | Presigned upload/stream |

**SignalR:** token WebSocket qua query `access_token` trên `/hubs/chat`. Client: `HubConnectionBuilder` + `accessTokenFactory`.

## 5. Auth & phân quyền

- JWT: claims `sub`, `role` (`user` | `admin`).
- Admin: policy `AdminOnly` — `role = admin`.
- FE: `contexts/auth-context.tsx`, header `Authorization: Bearer`.

## 6. Bản đồ API (nhóm)

| Prefix | Mục đích |
|--------|----------|
| `/api/auth` | register, login, refresh, me, forgot/reset |
| `/api/users` | public profile, me avatar/stats |
| `/api/movies` | list/detail, chapters, reviews, rate, favorite, … |
| `/api/chapters` | sources, stream-url |
| `/api/videos` | presigned-url, confirm-upload |
| `/api/celebrities`, `/api/news`, `/api/search` | discovery |
| `/api/social` | JWT — friends, messages, notifications, watchlist, history, reports |
| `/api/admin` | AdminOnly — stats, users, moderate, reports |
| `/api/purchases` (M8, sau triển khai) | checkout, webhook cổng VN, lịch sử mua — xem §16 |
| `/hubs/chat` | SignalR — event `message` |

DTO FE: `frontend/types/api.ts` ↔ `Models/DTOs/` (C#).

## 7. Database

EF Core `AppDbContext`; migration: `dotnet ef migrations add` / `database update`. Bảng `ContentReports` (moderation).

## 8. Frontend — quy ước

- API: `NEXT_PUBLIC_API_URL`; SSR có thể dùng `lib/server-fetch.ts`.
- Routes: `app/(auth)/`, `app/(main)/`, `app/user/`, `app/admin/`.
- Next: security headers trong `next.config.mjs`.

## 9–11. M5 / M6 / M7 (tóm tắt)

- **M5:** `/api/social`, `/hubs/chat`, trang friends/messages, notifications, watchlist/history/report.
- **M6:** `/api/admin`, `ContentReport`, `AdminModerationSection`.
- **M7:** compression, rate limit (~400/phút), `/health`, headers; go-live: secrets, CORS prod, TLS, load test.

## 12. Video (R2 + Hangfire)

Presigned upload → confirm → transcode jobs (`VideoUploadService`, `TranscodeProcessor`).

## 13. Linear & công việc

- **Project:** [DMovie](https://linear.app/dainndev/project/dmovie-bcb2257781d7) — milestones **M0–M8**.
- **M4b — Upload: preview & chỉnh sửa video:** preview local, wizard “xem lại & tinh chỉnh”, trim (FFmpeg), thumbnail từ frame, preview trên trang edit, upload VTT (kết hợp DAI-95) — **DAI-102 … DAI-108**.
- **M8a — Player & trải nghiệm xem** (nên làm **trước M8**): custom controls, phụ đề VTT, skip intro, resume, phím tắt, PiP, tùy chỉnh cỡ chữ & màu phụ đề, v.v. — issue **DAI-92 … DAI-101**, **[DAI-109](https://linear.app/dainndev/issue/DAI-109)** (cỡ chữ), **[DAI-110](https://linear.app/dainndev/issue/DAI-110)** (màu chữ) trên Linear.
- **M8 — Marketplace VN** (mua lẻ / miễn phí, hoa hồng ~10%): milestone + issue **DAI-77 … DAI-91** trên board (BE Purchase/Entitlement, quyền xem & chặn stream, checkout, webhook, FE, admin refund, ToS, Ops cổng, payout phase 2).
- Doc bổ sung cùng project: Architecture, Tech Stack, Database & API Overview, UI Screens, Roadmap.

## 14. M4b — Upload: preview & chỉnh sửa video (creator)

- **Mục tiêu:** sau khi chọn file, user **xem trước** (`URL.createObjectURL`), xem duration/resolution; bước wizard **tinh chỉnh** (trim đầu/cuối gửi backend FFmpeg, chụp frame làm thumbnail/poster, đính kèm `.vtt`); trang **`/upload/[movieId]/edit`** có preview chapter đã upload và cùng panel chỉnh sửa.
- **Phạm vi “pro” trên web:** trim / thumbnail / phụ đề là hợp lý; grading, multi-cam, mix âm thanh phức tạp nên khuyến khích export từ NLE rồi upload master (xem DAI-108).

## 15. M8a — Player & trải nghiệm xem (trước M8)

- **Mục tiêu:** nâng UX trang `/watch`: player tùy biến (thay `<video controls>`), phụ đề WebVTT, **tùy chỉnh cỡ chữ & màu chữ phụ đề** (người xem — lưu local hoặc prefs), **bỏ qua intro** (metadata trên `Chapter`), **tiếp tục xem** từ `watch-history`, phím tắt / mobile double-tap, loading & retry, PiP, spike HLS nếu cần.
- **Task (phụ đề — tách ticket):** [DAI-109 — cỡ chữ WebVTT](https://linear.app/dainndev/issue/DAI-109); [DAI-110 — màu chữ WebVTT](https://linear.app/dainndev/issue/DAI-110).
- **Code hiện tại:** `frontend/components/watch-experience.tsx` — `WatchVideoPlayer` + `GET/POST` watch-history, sources + stream-url.

## 16. M8 — Marketplace VN (mua lẻ / miễn phí)

- **Thị trường:** Việt Nam.
- **Mô hình:** Creator đặt **giá VND** hoặc **miễn phí** (không set fee). Viewer **mua lẻ** từng phim. Nền tảng thu **hoa hồng ~10%** (cấu hình qua appsettings) trên giao dịch có phí.
- **Kỹ thuật (kế hoạch):** bảng `Purchase` / entitlement; `CanUserWatchMovie`; endpoint stream chỉ trả URL khi đủ quyền; tạo đơn checkout + **webhook idempotent** (MoMo / VNPay / ZaloPay — chọn một cho v1); API `purchase-status`, lịch sử mua/bán; FE nút Mua / Xem free; trang doanh thu creator; admin hoàn tiền / khóa phim.
- **Sau MVP:** ví creator & payout VND (đối soát thủ công hoặc API đối tác).
- **Pháp lý / sản phẩm:** ToS marketplace (vai trò nền tảng vs người bán), hoàn tiền / tranh chấp; **review luật sư VN** trước khi thu phí thật — disclaimer không thay nghĩa vụ pháp luật.

---

*Cập nhật: 2026-03-28 — bổ sung M8; M8a phụ đề tách **DAI-109** (cỡ chữ) + **DAI-110** (màu chữ); đồng bộ repo `dainn-movie`.*
