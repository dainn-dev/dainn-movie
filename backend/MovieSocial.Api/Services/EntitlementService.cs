using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class EntitlementService(AppDbContext db)
{
    public static bool IsPaidListing(Movie movie) =>
        movie.ListingPriceVnd.HasValue && movie.ListingPriceVnd.Value > 0;

    /// <summary>Phim đã publish: xem free, admin/uploader, hoặc đã mua.</summary>
    public async Task<bool> CanWatchPublishedStreamAsync(Guid? viewerUserId, string? viewerRole, Movie movie)
    {
        if (movie.Status != "published") return false;
        if (!IsPaidListing(movie)) return true;
        if (viewerUserId is null) return false;
        if (string.Equals(viewerRole, "admin", StringComparison.OrdinalIgnoreCase)) return true;
        if (movie.UploadedById == viewerUserId) return true;
        return await db.Purchases.AsNoTracking()
            .AnyAsync(p => p.UserId == viewerUserId && p.MovieId == movie.Id && p.Status == "completed");
    }

    /// <summary>Trang chi tiết: cho phép xem thông tin; quyền phát video khi publish.</summary>
    public async Task<bool> ViewerCanPlayAsync(Movie movie, Guid? viewerUserId, string? viewerRole)
    {
        var isAdmin = string.Equals(viewerRole, "admin", StringComparison.OrdinalIgnoreCase);
        var isOwner = viewerUserId.HasValue && movie.UploadedById == viewerUserId;
        if (movie.Status != "published")
            return isAdmin || isOwner;
        if (!IsPaidListing(movie)) return true;
        return await CanWatchPublishedStreamAsync(viewerUserId, viewerRole, movie);
    }
}
