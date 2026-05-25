using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record AddCardCommand(Guid UserId, Guid BoardId, Guid ListId, string Title) : IRequest<Result<CardDto>>;
    public sealed class AddCardCommandValidator : AbstractValidator<AddCardCommand>
    {
        public AddCardCommandValidator() => RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
    }
    public sealed class AddCardHandler(IBoardRepository boards) : IRequestHandler<AddCardCommand, Result<CardDto>>
    {
        public async Task<Result<CardDto>> Handle(AddCardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            var card = board.AddCard(cmd.ListId, cmd.Title);
            await boards.SaveChangesAsync(ct);

            return new CardDto(card.Id, card.Title, card.Description, card.Position, card.DueDate, []);
        }
    }
}