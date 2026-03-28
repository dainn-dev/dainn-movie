using Hangfire.Dashboard;

namespace MovieSocial.Api;

public sealed class HangfireAllowAllDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
