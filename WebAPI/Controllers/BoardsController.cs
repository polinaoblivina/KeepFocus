using KeepFocus.Application.Features.Boards.Queries;
using KeepFocus.Application.Features.Boards.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [Route("api/boards")]
    public sealed class BoardsController(IMediator mediator) : BaseController(mediator)
    {
        public sealed record CreateBoardRequest(string Title, string? Description);
        public sealed record UpdateBoardRequest(string Title, string? Description);

        [HttpGet]
        public async Task<IActionResult> GetBoards(CancellationToken ct)
        {
            var result = await Mediator.Send(new GetBoardsQuery(UserId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpGet("{boardId:guid}")]
        public async Task<IActionResult> GetBoard(Guid boardId, CancellationToken ct)
        {
            var result = await Mediator.Send(new GetBoardQuery(UserId, boardId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBoard(CreateBoardRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send( new CreateBoardCommand(UserId, req.Title, req.Description), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPut("{boardId:guid}")]
        public async Task<IActionResult> UpdateBoard(Guid boardId, UpdateBoardRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new UpdateBoardCommand(UserId, boardId, req.Title, req.Description), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return Ok(result.Value);
        }

        [HttpDelete("{boardId:guid}")]
        public async Task<IActionResult> DeleteBoard(Guid boardId, CancellationToken ct)
        {
            var result = await Mediator.Send(new DeleteBoardCommand(UserId, boardId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }
    }
}
