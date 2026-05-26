using KeepFocus.Application.Features.Boards.Commands;
using KeepFocus.Application.Features.Boards.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{

    [Route("api/boards/{boardId:guid}/cards/{cardId:guid}/checklists")]
    public sealed class ChecklistsController(IMediator mediator) : BaseController(mediator)
    {
        public sealed record AddChecklistRequest(string Title);
        public sealed record UpdateChecklistRequest(string Title);
        public sealed record AddChecklistItemRequest(string Content);
        public sealed record UpdateChecklistItemRequest(string Content);
        public sealed record ReorderItemsRequest(IReadOnlyList<ChecklistItemPositionDto> Positions);

        [HttpPost]
        public async Task<IActionResult> AddChecklist(Guid boardId, Guid cardId, AddChecklistRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new AddChecklistCommand(UserId, boardId, cardId, req.Title), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPut("{checklistId:guid}")]
        public async Task<IActionResult> UpdateChecklist(Guid boardId, Guid cardId, Guid checklistId, UpdateChecklistRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new UpdateChecklistCommand(UserId, boardId, cardId, checklistId, req.Title), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpDelete("{checklistId:guid}")]
        public async Task<IActionResult> RemoveChecklist(Guid boardId, Guid cardId, Guid checklistId, CancellationToken ct)
        {
            var result = await Mediator.Send(new RemoveChecklistCommand(UserId, boardId, cardId, checklistId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPost("{checklistId:guid}/items")]
        public async Task<IActionResult> AddItem(Guid boardId, Guid cardId, Guid checklistId, AddChecklistItemRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new AddChecklistItemCommand(UserId, boardId, cardId, checklistId, req.Content), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPut("{checklistId:guid}/items/{itemId:guid}")]
        public async Task<IActionResult> UpdateItem(Guid boardId, Guid cardId, Guid checklistId, Guid itemId, UpdateChecklistItemRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new UpdateChecklistItemCommand(UserId, boardId, cardId, checklistId, itemId, req.Content), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPost("{checklistId:guid}/items/{itemId:guid}/toggle")]
        public async Task<IActionResult> ToggleItem(Guid boardId, Guid cardId, Guid checklistId, Guid itemId, CancellationToken ct)
        {
            var result = await Mediator.Send(new ToggleChecklistItemCommand(UserId, boardId, cardId, checklistId, itemId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPut("{checklistId:guid}/items/reorder")]
        public async Task<IActionResult> ReorderItems(Guid boardId, Guid cardId, Guid checklistId, ReorderItemsRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new ReorderChecklistItemsCommand(UserId, boardId, cardId, checklistId, req.Positions), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpDelete("{checklistId:guid}/items/{itemId:guid}")]
        public async Task<IActionResult> RemoveItem(Guid boardId, Guid cardId, Guid checklistId, Guid itemId, CancellationToken ct)
        {
            var result = await Mediator.Send(new RemoveChecklistItemCommand(UserId, boardId, cardId, checklistId, itemId), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return NoContent();
        }
    }
}