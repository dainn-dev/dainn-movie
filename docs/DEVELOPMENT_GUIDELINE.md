# DMovie — Development Guideline

*Tài liệu hướng dẫn làm việc hằng ngày cho team. Bản đồng bộ trên Linear:* [DMovie — Development Guideline](https://linear.app/dainndev/document/dmovie-development-guideline-849cd9be2adc) *(project **DMovie**).*

---

## 1. Mục đích

Chuẩn hóa cách **setup local**, **chạy FE/BE**, **đặt tên branch/commit**, **nối issue Linear**, và **mức tối thiểu** trước khi merge — giảm ma sát giữa frontend Next.js và backend ASP.NET Core.

## 2. Cấu trúc repo

| Thư mục | Vai trò |
|--------|---------|
| `frontend/` | Next.js (App Router), UI, gọi API BFF/backend |
| `backend/MovieSocial.Api/` | ASP.NET Core API, EF Core, Hangfire, SignalR |

Không commit **secrets**, **`.env.local`** đầy credential, hay artifact build (`bin/`, `obj/` nếu chưa ignore).

## 3. Stack & công cụ

- **Frontend:** Node 20+ (khuyến nghị), `pnpm` (xem `package.json` — có script `fnm` cho build).
- **Backend:** .NET 8 (`MovieSocial.Api.csproj`), PostgreSQL, Redis, Serilog.
- **Hợp đồng API:** FE giữ type tại `frontend/types/api.ts` (hoặc tương đương); đổi DTO backend → cập nhật FE và ghi chú trong PR.

## 4. Setup local

### 4.1 Backend

1. Cài .NET 8 SDK, PostgreSQL, Redis (hoặc Docker nếu team có compose).
2. Copy / tạo `appsettings.Development.json` (hoặc User Secrets) với:
   - `ConnectionStrings:Postgres`
   - Redis connection (theo cấu hình `Program.cs`)
   - JWT signing key / issuer / audience đúng với FE
3. Chạy migration EF nếu có hướng dẫn riêng trong team.
4. `dotnet run` trong `backend/MovieSocial.Api`.

### 4.2 Frontend

1. `cd frontend && pnpm install`
2. Tạo `.env.local`: biến base URL API (ví dụ `NEXT_PUBLIC_API_URL`) khớp backend cổng dev.
3. `pnpm dev`

### 4.3 CORS & cookie

Khi đổi cổng FE/BE, cập nhật **CORS** và URL auth trên backend để tránh lỗi đăng nhập cross-origin.

## 5. Chạy build / kiểm tra nhanh

| Lệnh | Khi nào |
|------|---------|
| `pnpm lint` / `pnpm build` (frontend) | Trước PR có thay đổi FE lớn |
| `dotnet build` (thư mục API) | Trước PR có thay đổi BE |

Ưu tiên sửa **lỗi lint/build** trên file đã chạm; không mở rộng refactor không liên quan ticket.

## 6. Quy ước code

- **Đổi tối thiểu:** Mỗi PR gắn một mục tiêu rõ (một issue hoặc một bug). Tránh “dọn dẹp” hàng loạt file không liên quan.
- **Backend:** Endpoint nhóm theo `Endpoints/`; validation FluentValidation; service tách khỏi HTTP khi logic phức tạp.
- **Frontend:** Ưu tiên component có sẵn (Radix/shadcn); `contexts/` cho auth toàn app; tránh duplicate fetch logic (gom hook/helper nếu lặp).
- **Commit message:** Tiếng Anh hoặc Việt nhất quán trong team; nên có mã issue: `DAI-123: mô tả ngắn`.

## 7. Git & Linear

- **Branch:** `anhnh/dai-xxx-mo-ta` (theo gợi ý Linear) hoặc quy ước team.
- **PR:** Mô tả ngắn: *làm gì, vì sao*, cách test; link issue **DMovie**.
- **Trạng thái issue:** Cập nhật khi bắt đầu / review / done theo workflow team.

## 8. Bảo mật & vận hành

- Không log JWT, refresh token, hay PII nhạy cảm.
- Rate limit / compression / headers: đã cấu hình ở API — khi thêm endpoint public, xem xét giới hạn và `health`.
- Hangfire dashboard: chỉ môi trường Development trừ khi có bảo vệ admin rõ ràng.

## 9. Tài liệu khác

- **Triển khai (deploy):** [Deployment Guideline trong repo](DEPLOYMENT_GUIDELINE.md) — Docker Compose, **GitHub Actions deploy backend**, Vercel, env, CORS, migration, checklist go-live; bản Linear: [DMovie — Deployment Guideline](https://linear.app/dainndev/document/dmovie-deployment-guideline-cbcbbe74c322).
- **Roadmap / sản phẩm:** các milestone M0–M8, M8a player, M4b upload — xem board Linear và guideline dự án (nếu có) trên workspace.
- **Đồng bộ:** Khi thay đổi quy trình dev quan trọng, cập nhật **file này** và tài liệu tương ứng trên Linear.

---

*Cập nhật: 2026-03-28 — bản đầu cho monorepo `dainn-movie`.*
