using KeepFocus.Application.Common;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands
{
    public sealed record CreateBoardCommand(Guid UserId, string Title, string? Description) : IRequest<Result<BoardSummaryDto>>;
    public sealed class CreateBoardCommandValidator : AbstractValidator<CreateBoardCommand>
    {
        public CreateBoardCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
        }
    }
    public sealed class CreateBoardHandler(IBoardRepository boards) : IRequestHandler<CreateBoardCommand, Result<BoardSummaryDto>>
    {
        public async Task<Result<BoardSummaryDto>> Handle(CreateBoardCommand cmd, CancellationToken ct)
        {
            var board = Board.Create(cmd.UserId, cmd.Title, cmd.Description);
            await boards.AddAsync(board, ct);
            await boards.SaveChangesAsync(ct);
            return BoardMapper.ToSummary(board);
        }
    }
}