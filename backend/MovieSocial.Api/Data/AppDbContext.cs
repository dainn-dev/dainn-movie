using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<MovieGenre> MovieGenres => Set<MovieGenre>();
    public DbSet<Celebrity> Celebrities => Set<Celebrity>();
    public DbSet<MovieCast> MovieCast => Set<MovieCast>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<VideoSource> VideoSources => Set<VideoSource>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Watchlist> Watchlist => Set<Watchlist>();
    public DbSet<WatchHistory> WatchHistory => Set<WatchHistory>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<News> News => Set<News>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<NewsTag> NewsTags => Set<NewsTag>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        base.OnModelCreating(m);
        m.HasDefaultSchema("public");

        // ── Users ───────────────────────────────────────────────────────────
        m.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.CreatedAt);
        });

        // ── Movies ──────────────────────────────────────────────────────────
        m.Entity<Movie>(e =>
        {
            e.HasIndex(mv => mv.Slug).IsUnique();
            e.HasIndex(mv => mv.Title);
            e.HasIndex(mv => mv.CreatedAt);
            e.HasIndex(mv => mv.Status);
            e.HasOne(mv => mv.UploadedBy)
             .WithMany(u => u.UploadedMovies)
             .HasForeignKey(mv => mv.UploadedById)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── MovieGenres (composite PK) ───────────────────────────────────────
        m.Entity<MovieGenre>(e =>
        {
            e.HasKey(mg => new { mg.MovieId, mg.GenreId });
            e.HasOne(mg => mg.Movie).WithMany(mv => mv.MovieGenres).HasForeignKey(mg => mg.MovieId);
            e.HasOne(mg => mg.Genre).WithMany(g => g.MovieGenres).HasForeignKey(mg => mg.GenreId);
        });

        // ── MovieCast (composite PK) ─────────────────────────────────────────
        m.Entity<MovieCast>(e =>
        {
            e.HasKey(mc => new { mc.MovieId, mc.CelebrityId, mc.Role });
            e.HasOne(mc => mc.Movie).WithMany(mv => mv.Cast).HasForeignKey(mc => mc.MovieId);
            e.HasOne(mc => mc.Celebrity).WithMany(c => c.MovieCast).HasForeignKey(mc => mc.CelebrityId);
        });

        // ── Chapters ─────────────────────────────────────────────────────────
        m.Entity<Chapter>(e =>
        {
            e.HasOne(ch => ch.Movie).WithMany(mv => mv.Chapters).HasForeignKey(ch => ch.MovieId);
        });

        // ── VideoSources ─────────────────────────────────────────────────────
        m.Entity<VideoSource>(e =>
        {
            e.HasIndex(vs => vs.R2Key).IsUnique();
            e.HasOne(vs => vs.Chapter).WithMany(ch => ch.VideoSources).HasForeignKey(vs => vs.ChapterId);
        });

        // ── Reviews ──────────────────────────────────────────────────────────
        m.Entity<Review>(e =>
        {
            e.HasIndex(r => new { r.UserId, r.MovieId });
            e.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Movie).WithMany(mv => mv.Reviews).HasForeignKey(r => r.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Ratings (composite PK) ───────────────────────────────────────────
        m.Entity<Rating>(e =>
        {
            e.HasKey(r => new { r.UserId, r.MovieId });
            e.HasOne(r => r.User).WithMany(u => u.Ratings).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Movie).WithMany(mv => mv.Ratings).HasForeignKey(r => r.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Favorites (composite PK) ─────────────────────────────────────────
        m.Entity<Favorite>(e =>
        {
            e.HasKey(f => new { f.UserId, f.MovieId });
            e.HasOne(f => f.User).WithMany(u => u.Favorites).HasForeignKey(f => f.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(f => f.Movie).WithMany(mv => mv.Favorites).HasForeignKey(f => f.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Watchlist (composite PK) ─────────────────────────────────────────
        m.Entity<Watchlist>(e =>
        {
            e.HasKey(w => new { w.UserId, w.MovieId });
            e.HasOne(w => w.User).WithMany(u => u.Watchlist).HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(w => w.Movie).WithMany(mv => mv.Watchlist).HasForeignKey(w => w.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── WatchHistory ─────────────────────────────────────────────────────
        m.Entity<WatchHistory>(e =>
        {
            e.HasIndex(wh => wh.UserId);
            e.HasIndex(wh => wh.WatchedAt);
            e.HasOne(wh => wh.User).WithMany(u => u.WatchHistory).HasForeignKey(wh => wh.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(wh => wh.Movie).WithMany(mv => mv.WatchHistory).HasForeignKey(wh => wh.MovieId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(wh => wh.Chapter).WithMany(ch => ch.WatchHistory).HasForeignKey(wh => wh.ChapterId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Friendship (composite PK) ────────────────────────────────────────
        m.Entity<Friendship>(e =>
        {
            e.HasKey(f => new { f.UserId, f.FriendId });
            e.HasOne(f => f.User).WithMany(u => u.Friendships).HasForeignKey(f => f.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(f => f.Friend).WithMany(u => u.FriendOf).HasForeignKey(f => f.FriendId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── FriendRequests ───────────────────────────────────────────────────
        m.Entity<FriendRequest>(e =>
        {
            e.HasIndex(fr => new { fr.SenderId, fr.ReceiverId });
            e.HasOne(fr => fr.Sender).WithMany(u => u.SentFriendRequests).HasForeignKey(fr => fr.SenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fr => fr.Receiver).WithMany(u => u.ReceivedFriendRequests).HasForeignKey(fr => fr.ReceiverId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Messages ─────────────────────────────────────────────────────────
        m.Entity<Message>(e =>
        {
            e.HasIndex(msg => new { msg.SenderId, msg.ReceiverId });
            e.HasIndex(msg => msg.CreatedAt);
            e.HasOne(msg => msg.Sender).WithMany(u => u.SentMessages).HasForeignKey(msg => msg.SenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(msg => msg.Receiver).WithMany(u => u.ReceivedMessages).HasForeignKey(msg => msg.ReceiverId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Notifications ─────────────────────────────────────────────────────
        m.Entity<Notification>(e =>
        {
            e.HasIndex(n => new { n.UserId, n.IsRead });
            e.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── News ─────────────────────────────────────────────────────────────
        m.Entity<News>(e =>
        {
            e.HasIndex(n => n.Slug).IsUnique();
            e.HasIndex(n => n.CreatedAt);
            e.HasOne(n => n.Author).WithMany(u => u.NewsArticles).HasForeignKey(n => n.AuthorId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── NewsTags (composite PK) ───────────────────────────────────────────
        m.Entity<NewsTag>(e =>
        {
            e.HasKey(nt => new { nt.NewsId, nt.TagId });
            e.HasOne(nt => nt.News).WithMany(n => n.NewsTags).HasForeignKey(nt => nt.NewsId);
            e.HasOne(nt => nt.Tag).WithMany(t => t.NewsTags).HasForeignKey(nt => nt.TagId);
        });

        // ── Celebrity ────────────────────────────────────────────────────────
        m.Entity<Celebrity>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // ── Seed Data ─────────────────────────────────────────────────────────
        SeedData(m);
    }

    private static void SeedData(ModelBuilder m)
    {
        // Genres
        m.Entity<Genre>().HasData(
            new Genre { Id = 1,  Name = "Action",      Slug = "action" },
            new Genre { Id = 2,  Name = "Adventure",   Slug = "adventure" },
            new Genre { Id = 3,  Name = "Animation",   Slug = "animation" },
            new Genre { Id = 4,  Name = "Comedy",      Slug = "comedy" },
            new Genre { Id = 5,  Name = "Crime",       Slug = "crime" },
            new Genre { Id = 6,  Name = "Documentary", Slug = "documentary" },
            new Genre { Id = 7,  Name = "Drama",       Slug = "drama" },
            new Genre { Id = 8,  Name = "Fantasy",     Slug = "fantasy" },
            new Genre { Id = 9,  Name = "Horror",      Slug = "horror" },
            new Genre { Id = 10, Name = "Mystery",     Slug = "mystery" },
            new Genre { Id = 11, Name = "Romance",     Slug = "romance" },
            new Genre { Id = 12, Name = "Sci-Fi",      Slug = "sci-fi" },
            new Genre { Id = 13, Name = "Thriller",    Slug = "thriller" },
            new Genre { Id = 14, Name = "Western",     Slug = "western" }
        );

        // Admin user (password: Admin@123 — change immediately in production)
        var adminId = new Guid("00000000-0000-0000-0000-000000000001");
        m.Entity<User>().HasData(new User
        {
            Id          = adminId,
            Username    = "admin",
            Email       = "admin@dmovie.local",
            PasswordHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/oA5oSO5Z2", // Admin@123
            DisplayName = "Administrator",
            Role        = "admin",
            IsVerified  = true,
            IsActive    = true,
            CreatedAt   = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt   = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });
    }
}
