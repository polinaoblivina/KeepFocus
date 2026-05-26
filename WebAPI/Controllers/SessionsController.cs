using KeepFocus.Application.Features.FocusSessions.Commands;
using KeepFocus.Application.Features.FocusSessions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [Route("api/sessions")]
    public sealed class SessionsController(IMediator mediator) : BaseController(mediator)
    {
        public sealed record StartSessionRequest(string Mode, string Type, int? CustomDurationSeconds,Guid? CardId);
        public sealed record StartBreakRequest(string BreakType, int DurationSeconds);
        public sealed record RecordTabEventRequest(string EventType, int DurationSeconds);

        [HttpGet("active")]
        public async Task<IActionResult> GetActive(CancellationToken ct)
        {
            var result = await Mediator.Send(new GetActiveSessionQuery(UserId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] DateTime? from, [FromQuery] DateTime? to,CancellationToken ct)
        {
            var result = await Mediator.Send(new GetSessionHistoryQuery(UserId, from, to), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start(StartSessionRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new StartSessionCommand(UserId, req.Mode, req.Type, req.CustomDurationSeconds, req.CardId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPost("{sessionId:guid}/heartbeat")]
        public async Task<IActionResult> Heartbeat(Guid sessionId, CancellationToken ct)
        {
            var result = await Mediator.Send(new HeartbeatCommand(UserId, sessionId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/pause")]
        public async Task<IActionResult> Pause(Guid sessionId, CancellationToken ct)
        {
            var result = await Mediator.Send(new PauseSessionCommand(UserId, sessionId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/resume")]
        public async Task<IActionResult> Resume(Guid sessionId, CancellationToken ct)
        {
            var result = await Mediator.Send(new ResumeSessionCommand(UserId, sessionId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/complete")]
        public async Task<IActionResult> Complete(Guid sessionId, CancellationToken ct)
        {
            var result = await Mediator.Send(new CompleteSessionCommand(UserId, sessionId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/abandon")]
        public async Task<IActionResult> Abandon(Guid sessionId, CancellationToken ct)
        {
            var result = await Mediator.Send(new AbandonSessionCommand(UserId, sessionId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/break")]
        public async Task<IActionResult> StartBreak(Guid sessionId, StartBreakRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new StartBreakCommand(UserId, sessionId, req.BreakType, req.DurationSeconds), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost("{sessionId:guid}/tab-event")]
        public async Task<IActionResult> RecordTabEvent(Guid sessionId, RecordTabEventRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new RecordTabEventCommand(UserId, sessionId, req.EventType, req.DurationSeconds), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return Ok(result.Value);
        }
    }
}