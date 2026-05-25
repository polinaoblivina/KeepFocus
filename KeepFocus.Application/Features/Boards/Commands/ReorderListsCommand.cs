using KeepFocus.Application.Common;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record ReorderListsCommand(Guid UserId, Guid BoardId, IReadOnlyList<ListPositionDto> Positions) : IRequest<Result>;
    public sealed class ReorderListsCommandValidator : AbstractValidator<ReorderListsCommand>
    {
        public ReorderListsCommandValidator()
        {
            RuleFor(x => x.Positions)
                .NotEmpty().WithMessage("Positions list cannot be empty.");

            RuleForEach(x => x.Positions)
                .ChildRules(item =>
                {
                    item.RuleFor(x => x.Position)
                        .GreaterThan(0).WithMessage("Position must be greater than 0.");
                });
        }
    }

    public sealed class ReorderListsHandler(IBoardRepository boards) : IRequestHandler<ReorderListsCommand, Result>
    {
        public async Task<Result> Handle(ReorderListsCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.ReorderLists(cmd.Positions.Select(p => (p.ListId, p.Position)));

            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}