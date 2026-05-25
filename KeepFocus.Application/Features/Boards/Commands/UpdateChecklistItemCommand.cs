using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record UpdateChecklistItemCommand(Guid UserId, Guid BoardId, Guid CardId, Guid ChecklistId, Guid ItemId, string Content) : IRequest<Result>;
    public sealed class UpdateChecklistItemCommandValidator : AbstractValidator<UpdateChecklistItemCommand>
    {
        public UpdateChecklistItemCommandValidator() =>
            RuleFor(x => x.Content).NotEmpty().MaximumLength(500);
    }
    public sealed class UpdateChecklistItemHandler(IBoardRepository boards) : IRequestHandler<UpdateChecklistItemCommand, Result>
    {
        public async Task<Result> Handle(UpdateChecklistItemCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetFullAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.UpdateChecklistItemContent(cmd.CardId, cmd.ChecklistId, cmd.ItemId, cmd.Content);
            await boards.SaveChangesAsync(ct);
            return Result.Ok;
        }
    }
}
