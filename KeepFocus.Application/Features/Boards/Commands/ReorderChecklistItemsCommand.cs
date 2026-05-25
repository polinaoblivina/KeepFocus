using KeepFocus.Application.Common;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record ReorderChecklistItemsCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, IReadOnlyList<ChecklistItemPositionDto> Positions) : IRequest<Result>;
    public sealed class ReorderChecklistItemsCommandValidator : AbstractValidator<ReorderChecklistItemsCommand>
    {
        public ReorderChecklistItemsCommandValidator()
        {
            RuleFor(x => x.Positions).NotEmpty();
            RuleForEach(x => x.Positions).ChildRules(item =>
                item.RuleFor(x => x.Position).GreaterThan(0));
        }
    }
    public sealed class ReorderChecklistItemsHandler(IBoardRepository boards) : IRequestHandler<ReorderChecklistItemsCommand, Result>
    {
        public async Task<Result> Handle(ReorderChecklistItemsCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.ReorderChecklistItems(
                cmd.CardId,
                cmd.ChecklistId,
                cmd.Positions.Select(p => (p.ItemId, p.Position)));

            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}