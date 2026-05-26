using KeepFocus.Application.Features.Boards.Queries;
using KeepFocus.Application.Features.Boards.Commands;
using KeepFocus.Application.Features.Boards.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{
    [Route("api/boards/{boardId:guid}/lists")]
    public sealed class ListsController(IMediator mediator) : BaseController(mediator)
    {
        public sealed record AddListRequest(string Title);
        public sealed record RenameListRequest(string Title);
        public sealed record ReorderListsRequest(IReadOnlyList<ListPositionDto> Positions);

        [HttpPost]
        public async Task<IActionResult> AddList(Guid boardId, AddListRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new AddListCommand(UserId, boardId, req.Title), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPut("{listId:guid}")]
        public async Task<IActionResult> RenameList(Guid boardId, Guid listId, RenameListRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new RenameListCommand(UserId, boardId, listId, req.Title), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderLists(Guid boardId, ReorderListsRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new ReorderListsCommand(UserId, boardId, req.Positions), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpDelete("{listId:guid}")]
        public async Task<IActionResult> DeleteList(Guid boardId, Guid listId, CancellationToken ct)
        {
            var result = await Mediator.Send(new DeleteListCommand(UserId, boardId, listId), ct);
            if (result.IsFailure) return MapError(result.Error!);
            return NoContent();
        }
    }
}
