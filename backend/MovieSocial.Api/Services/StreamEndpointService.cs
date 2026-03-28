using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;
using MovieSocial.Api.Models.Entities;

namespace MovieSocial.Api.Services;

public class StreamEndpointService(AppDbContext db)
{
    public async Task<(IReadOnlyList<StreamEndpointDto> items, string? err, int status)> ListAsync(
        Guid videoSourceId, Guid userId, string role)
    {
        var vs = await db.VideoSources
            .AsNoTracking()
            .Include(v => v.Chapter)
            .ThenInclude(c => c.Movie)
            .FirstOrDefaultAsync(v => v.Id == videoSourceId)
            .ConfigureAwait(false);
        if (vs is null) return ([], "VideoSource không tồn tại.", 404);
        if (!CanManage(vs.Chapter.Movie, userId, role)) return ([], "Không có quyền.", 403);

        var list = await db.VideoSourceEndpoints.AsNoTracking()
            .Where(e => e.VideoSourceId == videoSourceId)
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.CreatedAt)
            .Select(e => new StreamEndpointDto(e.Id, e.SortOrder, e.R2Key, e.DirectUrl))
            .ToListAsync()
            .ConfigureAwait(false);
        return (list, null, 200);
    }

    public async Task<(StreamEndpointDto? dto, string? err, int status)> CreateAsync(
        Guid videoSourceId, Guid userId, string role, CreateStreamEndpointRequest req)
    {
        var vs = await db.VideoSources
            .Include(v => v.Chapter)
            .ThenInclude(c => c.Movie)
            .FirstOrDefaultAsync(v => v.Id == videoSourceId)
            .ConfigureAwait(false);
        if (vs is null) return (null, "VideoSource không tồn tại.", 404);
        if (!CanManage(vs.Chapter.Movie, userId, role)) return (null, "Không có quyền.", 403);

        var r2 = string.IsNullOrWhiteSpace(req.R2Key) ? null : req.R2Key.Trim();
        var direct = string.IsNullOrWhiteSpace(req.DirectUrl) ? null : req.DirectUrl.Trim();
        if (r2 is null && direct is null)
            return (null, "Cần r2Key hoặc directUrl.", 400);

        var now = DateTime.UtcNow;
        var ep = new VideoSourceEndpoint
        {
            VideoSourceId = videoSourceId,
            SortOrder     = req.SortOrder ?? 0,
            R2Key         = r2,
            DirectUrl     = direct,
            CreatedAt     = now,
            UpdatedAt     = now,
        };
        db.VideoSourceEndpoints.Add(ep);
        await db.SaveChangesAsync().ConfigureAwait(false);
        return (new StreamEndpointDto(ep.Id, ep.SortOrder, ep.R2Key, ep.DirectUrl), null, 200);
    }

    public async Task<(bool ok, string? err, int status)> DeleteAsync(Guid endpointId, Guid userId, string role)
    {
        var ep = await db.VideoSourceEndpoints
            .Include(e => e.VideoSource)
            .ThenInclude(v => v.Chapter)
            .ThenInclude(c => c.Movie)
            .FirstOrDefaultAsync(e => e.Id == endpointId)
            .ConfigureAwait(false);
        if (ep is null) return (false, "Endpoint không tồn tại.", 404);
        if (!CanManage(ep.VideoSource.Chapter.Movie, userId, role)) return (false, "Không có quyền.", 403);

        db.VideoSourceEndpoints.Remove(ep);
        await db.SaveChangesAsync().ConfigureAwait(false);
        return (true, null, 200);
    }

    private static bool CanManage(Movie movie, Guid userId, string role) =>
        string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase) || movie.UploadedById == userId;
}
