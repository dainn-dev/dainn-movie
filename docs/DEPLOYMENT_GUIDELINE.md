# DMovie — Deployment Guideline

*Tài liệu triển khai **frontend (Next.js)** và **backend (ASP.NET Core)** — Docker Compose, biến môi trường, CORS, DB/Redis, R2, checklist go-live. Bản đồng bộ trên Linear:* [DMovie — Deployment Guideline](https://linear.app/dainndev/document/dmovie-deployment-guideline-cbcbbe74c322).

---

## 1. Kiến trúc triển khai

| Thành phần | Vai trò | Ghi chú |
|------------|---------|---------|
| **Frontend** | Next.js App Router, gọi API public | Build `output: 'standalone'` khi deploy Linux/Docker/Vercel (xem `frontend/next.config.mjs`). |
| **API** | `MovieSocial.Api` — REST, SignalR, Hangfire | Lắng nghe cổng **8080** trong container (`ASPNETCORE_URLS`). |
| **PostgreSQL** | EF Core, dữ liệu chính | Compose: image `postgres:16-alpine`. |
| **Redis** | Cache / rate limit / SignalR backplane (nếu cấu hình) | Compose: `redis:7-alpine`. |
| **Cloudflare R2** | Lưu trữ video/object, URL public | Cấu hình section `Cloudflare:R2` + biến môi trường. |

Hai dịch vụ **FE** và **API** thường deploy **độc lập** (hai host hoặc hai container service). FE chỉ biết API qua `NEXT_PUBLIC_*` (build-time cho các biến public).

---

## 2. Môi trường & nguyên tắc

- **Development:** `dotnet run` + `pnpm dev`, hoặc `docker compose` với `docker-compose.override.yml` (hot reload, DB `moviesocial_dev`).
- **Production-like / staging:** `docker compose up` **không** override — image release, DB `moviesocial`, `ASPNETCORE_ENVIRONMENT=Production` trên API.
- **Production thực tế:** tách managed DB/Redis (RDS, Azure DB, ElastiCache, Upstash…), secrets trong vault/platform, **không** commit `.env` có mật khẩu.

Luôn tách **secret** khỏi git; chỉ dùng file `.env` local hoặc secret manager của PaaS.

---

## 3. Triển khai bằng Docker Compose (repo)

### 3.1 Chuẩn bị

1. Cài [Docker](https://docs.docker.com/get-docker/) + Compose plugin.
2. Tạo `.env` **ở root repo** (cạnh `docker-compose.yml`). Không commit. Biến tham chiếu từ `docker-compose.yml`:

| Biến | Ý nghĩa |
|------|---------|
| `POSTGRES_USER` | User PostgreSQL |
| `POSTGRES_PASSWORD` | Password PostgreSQL |
| `JWT_SECRET` | Khóa ký JWT (đủ dài, ngẫu nhiên) |
| `CF_R2_ACCOUNT_ID`, `CF_R2_ACCESS_KEY_ID`, `CF_R2_SECRET_ACCESS_KEY`, `CF_R2_BUCKET_NAME`, `CF_R2_PUBLIC_URL` | R2 (AccountId map vào config API qua compose) |

Compose đã map `Cloudflare__R2__*` và `ConnectionStrings__*`, `Jwt__*`, `Cors__AllowedOrigins__0` cho service `api`.

### 3.2 Chạy production-style (stack đầy đủ)

```bash
docker compose up --build -d
```

- FE: `http://localhost:3000` — `NEXT_PUBLIC_API_URL=http://localhost:5000` (host map cổng 5000 → API 8080).
- API: `http://localhost:5000` — health: `GET /health` (healthcheck trong compose dùng `http://localhost:8080/health` **bên trong** container).

### 3.3 Chạy dev với override

File `docker-compose.override.yml` được Compose tự merge: DB tên `moviesocial_dev`, API `Development`, FE bind mount + `npm run dev`.

```bash
docker compose up --build
```

### 3.4 Migration database (lần đầu hoặc sau khi pull migration mới)

Trong môi trường có .NET SDK (không bắt buộc trong container nếu bạn chạy migrate từ máy dev):

```bash
cd backend/MovieSocial.Api
dotnet ef database update --connection "Host=localhost;Port=5432;Database=moviesocial;Username=...;Password=..."
```

Đổi connection string khớp DB thật (compose production dùng DB `moviesocial`). Trên CI/CD có thể chạy `dotnet ef database update` trong bước release có quyền vào Postgres.

---

## 4. CI/CD — GitHub Actions (deploy backend API)

Workflow: [`.github/workflows/deploy-backend.yml`](https://github.com/dainn-dev/dainn-movie/blob/master/.github/workflows/deploy-backend.yml).

### 4.1 Khi nào chạy

- **Push** lên nhánh **`master`** khi có thay đổi dưới `backend/**` hoặc file workflow.
- **`workflow_dispatch`** — chạy thủ công từ tab Actions.

### 4.2 Các bước pipeline

1. **Build & test** (`ubuntu-latest`, .NET 8): `dotnet restore` / `build` / `test` trên **`backend/MovieSocial.sln`**. Cache NuGet theo `*.csproj` + `NuGet.Config`.
2. **Build & push image Docker:** context `./backend`, Dockerfile `MovieSocial.Api/Dockerfile`, đăng nhập Docker Hub, Buildx, push **`linux/amd64`** và **`linux/arm64`**, tag mặc định **`dainndev/dmovie-api:latest`** (đổi trong YAML nếu dùng registry khác).
3. **Deploy:** `POST` tới webhook **Dokploy** (body JSON tùy cấu hình Dokploy).

### 4.3 Secrets GitHub (Settings → Secrets and variables → Actions)

| Secret | Mục đích |
|--------|----------|
| `DOCKERHUB_USERNAME` | Đăng nhập Docker Hub để push image |
| `DOCKERHUB_TOKEN` | Token/password Docker Hub |
| `DOKPLOY_WEBHOOK_URL` | URL webhook kích hoạt redeploy trên Dokploy |

**Dokploy / runtime:** application trên Dokploy phải trỏ tới image/tag trùng workflow (ví dụ `dainndev/dmovie-api:latest`) và có env production (Postgres, Redis, JWT, R2, CORS…) — không lưu trong git.

### 4.4 Ghi chú

- Repo hiện **chưa có** project test riêng; bước `dotnet test` vẫn chạy để sẵn sàng khi thêm `*Tests.csproj` vào solution.
- Frontend **chưa** có workflow deploy trong repo; triển khai FE thường qua Vercel (mục 6).

---

## 5. Build image riêng (không dùng compose build)

### 5.1 API

Context: thư mục `backend/` (đúng với `docker-compose`).

```bash
docker build -f MovieSocial.Api/Dockerfile -t moviesocial-api:latest .
```

### 5.2 Frontend

Context: `frontend/`. Next **cần** standalone khi chạy image `node server.js` — trên Linux build image đặt `output: 'standalone'` (mặc định khi không phải Windows).

```bash
cd frontend
docker build -t moviesocial-web:latest .
```

Biến `NEXT_PUBLIC_*` phải có **tại thời điểm `docker build`** (truyền `--build-arg` nếu Dockerfile được mở rộng), hoặc runtime nếu chuyển sang cơ chế inject env tùy chỉnh. Hiện `docker-compose.yml` set `environment` trên service `frontend` — với Next, các `NEXT_PUBLIC_*` thường **inline vào bundle khi build**; với production Docker nên dùng **build args** trùng URL API production, hoặc rebuild image khi đổi API URL.

---

## 6. Frontend trên Vercel (phổ biến với Next)

1. **Project:** trỏ root vào `frontend/` (hoặc monorepo với Root Directory = `frontend`).
2. **Install:** `pnpm install` (Framework: Next.js).
3. **Build command:** `pnpm build` (đảm bảo Node 20).
4. **Environment variables** (Vercel → Settings → Environment Variables):

   - `NEXT_PUBLIC_API_URL` — URL **HTTPS** API production (ví dụ `https://api.example.com`).
   - `NEXT_PUBLIC_SIGNALR_URL` — thường `https://api.example.com/hubs/chat` (cùng origin API hoặc subdomain).
   - `NEXT_PUBLIC_CF_R2_URL` hoặc biến public tương đương nếu FE cần domain R2.

5. Sau khi đổi biến public: **Redeploy** để rebuild.

**Lưu ý:** `next.config.mjs` bật header bảo mật (HSTS, X-Frame-Options, …) — phù hợp production; kiểm tra không chặn embed hợp lệ nếu có yêu cầu đặc biệt.

---

## 7. Backend trên server / cloud

### 7.1 Container (khuyến nghị)

Chạy image đã build (mục 5.1) trên ECS, AKS, Cloud Run, Fly.io, v.v.:

- Set **tất cả** biến tương đương `appsettings.json` qua env (chuỗi `Section__Key` như trong compose).
- **CORS:** `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, … hoặc mở rộng `Program.cs` để đọc mảng từ config — **bắt buộc** thêm domain FE production (ví dụ `https://movie.example.com`).
- **PORT:** image dùng `8080`; platform có thể inject `PORT` — nếu khác, map reverse proxy (Nginx/Caddy) tới cổng process.

### 7.2 Reverse proxy & TLS

- Terminate TLS tại proxy; forward HTTP tới container.
- WebSocket / SignalR: bật **upgrade** headers (`Connection`, `Upgrade`) trên Nginx/Caddy.
- Sticky session: nếu scale **nhiều instance** API và SignalR in-memory, cân nhắc **Redis backplane** hoặc **Azure SignalR Service**; nếu không, scale 1 instance hoặc chấp nhận rủi ro.

### 7.3 Hangfire

Dashboard Hangfire trong code thường giới hạn **Development**. Production: bật auth admin rõ ràng hoặc tắt dashboard public — xác nhận trong `Program.cs` trước go-live.

---

## 8. Health, log, giám sát

- **API:** `GET /health` — dùng cho load balancer và Docker healthcheck.
- **Serilog:** file rolling `logs/app-*.log` (cấu hình có thể mở rộng sink ra Seq/CloudWatch).
- **Frontend container:** healthcheck `wget` tới cổng 3000 (xem compose).

---

## 9. Checklist trước go-live

- [ ] `Jwt:Secret` production **khác** development, đủ entropy; xoay khóa có kế hoạch.
- [ ] Postgres backup tự động; đã chạy `dotnet ef database update` trên DB production.
- [ ] Redis persistence/HA theo nhu cầu (compose dev dùng volume `redisdata`).
- [ ] R2 bucket policy và `PublicUrl` khớp CDN/domain.
- [ ] CORS gồm **mọi** origin FE thực tế (www / non-www).
- [ ] `NEXT_PUBLIC_*` trùng URL public API (HTTPS).
- [ ] SignalR hoạt động qua HTTPS + proxy (thử chat thật).
- [ ] Rate limit và quota R2 phù hợp traffic dự kiến.
- [ ] Không expose Hangfire dashboard không bảo vệ.

---

## 10. Rollback

- **Container:** giữ tag image bản trước; deploy lại tag cũ; DB rollback chỉ khi có migration tương thích (migrate down hoặc restore snapshot).
- **Vercel:** Promote deployment trước đó trong dashboard.

---

## 11. Đồng bộ tài liệu

Khi đổi cổng, biến env, hoặc flow CI/CD: cập nhật **file này** và document tương ứng trên Linear project **DMovie**.

---

*Tài liệu tham chiếu repo: `.github/workflows/deploy-backend.yml`, `docker-compose.yml`, `docker-compose.override.yml`, `frontend/Dockerfile`, `backend/MovieSocial.Api/Dockerfile`, `backend/MovieSocial.Api/appsettings.json`, `backend/MovieSocial.Api/Program.cs` (CORS). Cập nhật: 2026-04-02 — bổ sung §4 CI/CD GitHub Actions.*
