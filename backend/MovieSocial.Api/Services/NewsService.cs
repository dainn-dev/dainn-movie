using Microsoft.EntityFrameworkCore;
using MovieSocial.Api.Data;
using MovieSocial.Api.Models.DTOs;

namespace MovieSocial.Api.Services;

public class NewsService(AppDbContext db)
{
    public async Task<PagedResult<NewsListDto>> ListAsync(string? tag, int page, int pageSize)
    {
        var q = db.News.AsNoTracking()
            .Where(n => n.IsPublished);

        if (!string.IsNullOrWhiteSpace(tag))
            q = q.Where(n => n.NewsTags.Any(nt => nt.Tag.Slug == tag));

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(n => new NewsListDto(
                n.Id, n.Title, n.Slug, n.CoverUrl,
                n.Author.DisplayName,
                n.CreatedAt,
                n.NewsTags.Select(nt => nt.Tag.Name)))
            .ToListAsync();

        return new PagedResult<NewsListDto>(items,
            new PaginationMeta(page, pageSize, total, (int)Math.Ceiling((double)total / pageSize)));
    }

    public async Task<NewsDetailDto?> GetBySlugAsync(string slug)
    {
        var n = await db.News.AsNoTracking()
            .Include(n => n.Author)
            .Include(n => n.NewsTags).ThenInclude(nt => nt.Tag)
            .FirstOrDefaultAsync(n => n.Slug == slug && n.IsPublished);

        return n is null ? null : new NewsDetailDto(
            n.Id, n.Title, n.Slug, n.Content, n.CoverUrl,
            n.Author.DisplayName, n.CreatedAt,
            n.NewsTags.Select(nt => nt.Tag.Name));
    }
}
