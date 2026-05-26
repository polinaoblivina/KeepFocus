using KeepFocus.Application.Features.FocusSessions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;

namespace KeepFocus.WebAPI.Hubs
{
    [Authorize]
    public sealed class SessionHub(IMediator mediator) : Hub
    {
        private Guid UserId => Guid.Parse(Context.User!.FindFirst(JwtRegisteredClaimNames.Sub)!.Value);

        public async Task Pause(Guid sessionId)
        {
            var result = await mediator.Send(new PauseSessionCommand(UserId, sessionId));

            if (result.IsSuccess)
                await Clients.Caller.SendAsync("State", new{status = result.Value!.Status, elapsed = result.Value.ElapsedSeconds});
            else
                await Clients.Caller.SendAsync("Error", result.Error!.Message);
        }

        public async Task Resume(Guid sessionId)
        {
            var result = await mediator.Send(new ResumeSessionCommand(UserId, sessionId));

            if (result.IsSuccess)
                await Clients.Caller.SendAsync("State", new{status = result.Value!.Status, elapsed = result.Value.ElapsedSeconds});
            else
                await Clients.Caller.SendAsync("Error", result.Error!.Message);
        }

        public async Task TabHidden(Guid sessionId, int durationSeconds)
        {
            var result = await mediator.Send(new RecordTabEventCommand(UserId, sessionId, "Hidden", durationSeconds));

            if (result.IsSuccess)
                await Clients.Caller.SendAsync("State", new {status = result.Value!.Status, elapsed = result.Value.ElapsedSeconds});
        }

        public async Task TabVisible(Guid sessionId, int durationSeconds)
        {
            var result = await mediator.Send(new RecordTabEventCommand(UserId, sessionId, "Visible", durationSeconds));

            if (result.IsSuccess)
                await Clients.Caller.SendAsync("State", new{status = result.Value!.Status,elapsed = result.Value.ElapsedSeconds});
        }
        public override Task OnConnectedAsync()
        {
            var sessionIdStr = Context.GetHttpContext()?.Request.Query["sessionId"].ToString();

            Context.Items["UserId"] = UserId;
            Context.Items["SessionId"] = Guid.TryParse(sessionIdStr, out var sid) ? sid : (Guid?)null;

            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.Items["UserId"] is Guid userId && Context.Items["SessionId"] is Guid sessionId)
            {
                await mediator.Send(new AbandonSessionCommand(userId, sessionId));
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}