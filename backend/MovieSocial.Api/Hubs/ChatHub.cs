using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MovieSocial.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var uid = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
               ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(uid))
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(uid));
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var uid = Context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
               ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(uid))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserGroup(uid));
        await base.OnDisconnectedAsync(exception);
    }

    public static string UserGroup(string userId) => $"u:{userId}";
}
