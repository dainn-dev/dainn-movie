namespace MovieSocial.Api.Models.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = "user"; // user | admin
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Movie> UploadedMovies { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Rating> Ratings { get; set; } = [];
    public ICollection<Favorite> Favorites { get; set; } = [];
    public ICollection<Watchlist> Watchlist { get; set; } = [];
    public ICollection<MovieFollow> MovieFollows { get; set; } = [];
    public ICollection<PushSubscription> PushSubscriptions { get; set; } = [];
    public ICollection<WatchHistory> WatchHistory { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<News> NewsArticles { get; set; } = [];
    public ICollection<Message> SentMessages { get; set; } = [];
    public ICollection<Message> ReceivedMessages { get; set; } = [];
    public ICollection<FriendRequest> SentFriendRequests { get; set; } = [];
    public ICollection<FriendRequest> ReceivedFriendRequests { get; set; } = [];
    public ICollection<Friendship> Friendships { get; set; } = [];
    public ICollection<Friendship> FriendOf { get; set; } = [];
    public ICollection<Purchase> Purchases { get; set; } = [];
    public ICollection<PayoutRequest> PayoutRequests { get; set; } = [];
}
