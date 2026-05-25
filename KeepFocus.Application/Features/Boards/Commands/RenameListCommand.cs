using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record RenameListCommand(Guid UserId, Guid BoardId, Guid ListId,string Title) : IRequest<Result>;
    public sealed class RenameListCommandValidator : AbstractValidator<RenameListCommand>
    {
        public RenameListCommandValidator() =>
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }

    public sealed class RenameListHandler(IBoardRepository boards) : IRequestHandler<RenameListCommand, Result>
    {
        public async Task<Result> Handle(RenameListCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.RenameList(cmd.ListId, cmd.Title);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
