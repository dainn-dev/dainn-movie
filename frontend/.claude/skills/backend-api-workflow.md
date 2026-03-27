# Backend API Workflow (ASP.NET Core 8)

Dùng khi build hoặc sửa API endpoints trong project backend.

## Cấu trúc thư mục backend (kế hoạch)

```
MovieSocial.Api/
  Program.cs                    # Entry point, DI, middleware
  appsettings.json              # Config (DB, Redis, R2, JWT)
  Endpoints/
    AuthEndpoints.cs            # /api/auth/*
    MovieEndpoints.cs           # /api/movies/*
    VideoEndpoints.cs           # /api/videos/*
    UserEndpoints.cs            # /api/users/*
    FriendEndpoints.cs          # /api/friends/*
    ReviewEndpoints.cs          # /api/movies/{id}/reviews/*
  Models/
    Entities/                   # EF Core entities (User, Movie, Chapter...)
    DTOs/                       # Request/Response DTOs
  Services/
    AuthService.cs
    MovieService.cs
    VideoService.cs (R2 presigned URLs)
    FriendService.cs
    ChatService.cs
  Hubs/
    ChatHub.cs                  # SignalR real-time chat
  Jobs/
    TranscodeJob.cs             # Hangfire FFmpeg transcoding
  Data/
    AppDbContext.cs             # EF Core DbContext
    Migrations/                 # EF migrations
```

## Pattern cho Minimal API Endpoint

```csharp
// Endpoints/MovieEndpoints.cs
public static class MovieEndpoints
{
    public static void MapMovieEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/movies")
            .WithTags("Movies");

        group.MapGet("/", GetMovies);
        group.MapGet("/{id:int}", GetMovie);
        group.MapPost("/", CreateMovie).RequireAuthorization();
        group.MapPut("/{id:int}", UpdateMovie).RequireAuthorization();
    }

    static async Task<IResult> GetMovies(
        [FromQuery] string category = "popular",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        MovieService movieService = default!)
    {
        var movies = await movieService.GetMoviesAsync(category, page, pageSize);
        return Results.Ok(movies);
    }

    static async Task<IResult> GetMovie(int id, MovieService movieService)
    {
        var movie = await movieService.GetByIdAsync(id);
        return movie is null ? Results.NotFound() : Results.Ok(movie);
    }
}
```

## Response format chuẩn

```json
// Thành công — list
{
  "data": [...],
  "pagination": { "page": 1, "pageSize": 20, "total": 150 }
}

// Thành công — single
{
  "data": { ... }
}

// Lỗi
{
  "error": "NOT_FOUND",
  "message": "Movie not found",
  "statusCode": 404
}
```

## Checklist trước khi tạo endpoint

- [ ] Input validation (FluentValidation hoặc DataAnnotations)
- [ ] Auth required? Thêm `.RequireAuthorization()`
- [ ] Rate limiting? Thêm rate limit policy
- [ ] Return đúng HTTP status code (200, 201, 400, 401, 404, 500)
- [ ] Response có pagination nếu trả về list
- [ ] Log errors (không log sensitive data)

## Database migrations

```bash
# Tạo migration mới
dotnet ef migrations add <MigrationName>

# Apply migration lên DB
dotnet ef database update

# Rollback migration
dotnet ef database update <PreviousMigrationName>
```

## Chạy backend locally

```bash
cd MovieSocial.Api
dotnet run
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

## Docker Compose services

```yaml
services:
  api:
    build: ./MovieSocial.Api
    ports: ["5000:80"]
    environment:
      - ConnectionStrings__Default=Host=postgres;Database=moviesocial;...
      - Redis__Connection=redis:6379
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  frontend:
    build: ./movie-next
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://api:5000
```
