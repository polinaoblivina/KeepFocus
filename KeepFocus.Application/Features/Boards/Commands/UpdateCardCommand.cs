using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record UpdateCardCommand(Guid UserId, Guid BoardId, Guid CardId, string Title, string? Description, DateOnly? DueDate) : IRequest<Result>;
    public sealed class UpdateCardCommandValidator : AbstractValidator<UpdateCardCommand>
    {
        public UpdateCardCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
            RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description is not null);
        }
    }
    public sealed class UpdateCardHandler(IBoardRepository boards) : IRequestHandler<UpdateCardCommand, Result>
    {
        public async Task<Result> Handle(UpdateCardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.UpdateCard(cmd.CardId, cmd.Title, cmd.Description, cmd.DueDate);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}