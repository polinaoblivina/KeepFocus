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
    public sealed record UpdateBoardCommand(Guid UserId, Guid BoardId, string Title, string? Description) : IRequest<Result<BoardSummaryDto>>;
    public sealed class UpdateBoardCommandValidator : AbstractValidator<UpdateBoardCommand>
    {
        public UpdateBoardCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
        }
    }

    public sealed class UpdateBoardHandler(IBoardRepository boards) : IRequestHandler<UpdateBoardCommand, Result<BoardSummaryDto>>
    {
        public async Task<Result<BoardSummaryDto>> Handle(UpdateBoardCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetByIdAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");

            board.Update(cmd.Title, cmd.Description);
            await boards.SaveChangesAsync(ct);
            return BoardMapper.ToSummary(board);
        }
    }
}
