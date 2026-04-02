using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace MovieSocial.Api.Services;

public static class AuthCookieHelper
{
    public const string CookieName = "refreshToken";

    public static void SetRefreshCookie(HttpResponse response, string refreshToken, TimeSpan maxAge, IHostEnvironment env)
    {
        response.Cookies.Append(CookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure     = env.IsProduction(),
            SameSite   = SameSiteMode.Lax,
            MaxAge     = maxAge,
            Path       = "/",
        });
    }

    public static void ClearRefreshCookie(HttpResponse response, IHostEnvironment env)
    {
        response.Cookies.Delete(CookieName, new CookieOptions
        {
            Path     = "/",
            Secure   = env.IsProduction(),
            SameSite = SameSiteMode.Lax,
        });
    }
}
