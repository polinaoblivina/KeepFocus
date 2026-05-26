using KeepFocus.Application.Features.Boards.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KeepFocus.WebAPI.Controllers
{

    [Route("api/boards/{boardId:guid}")]
    public sealed class CardsController(IMediator mediator) : BaseController(mediator)
    {
        public sealed record AddCardRequest(Guid ListId, string Title);
        public sealed record UpdateCardRequest(string Title, string? Description, DateOnly? DueDate);
        public sealed record MoveCardRequest(Guid TargetListId, int Position);

        [HttpPost("cards")]
        public async Task<IActionResult> AddCard(Guid boardId, AddCardRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new AddCardCommand(UserId, boardId, req.ListId, req.Title), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return StatusCode(201, result.Value);
        }

        [HttpPut("cards/{cardId:guid}")]
        public async Task<IActionResult> UpdateCard(Guid boardId, Guid cardId, UpdateCardRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new UpdateCardCommand(UserId, boardId, cardId, req.Title, req.Description, req.DueDate), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpPut("cards/{cardId:guid}/move")]
        public async Task<IActionResult> MoveCard(Guid boardId, Guid cardId, MoveCardRequest req, CancellationToken ct)
        {
            var result = await Mediator.Send(new MoveCardCommand(UserId, boardId, cardId, req.TargetListId, req.Position), ct);
            if (result.IsFailure)
                return MapError(result.Error!);
            return NoContent();
        }

        [HttpDelete("lists/{listId:guid}/cards/{cardId:guid}")]
        public async Task<IActionResult> DeleteCard(Guid boardId, Guid listId, Guid cardId, CancellationToken ct)
        {
            var result = await Mediator.Send(new DeleteCardCommand(UserId, boardId, listId, cardId), ct);
            if (result.IsFailure) 
                return MapError(result.Error!);
            return NoContent();
        }
    }
}