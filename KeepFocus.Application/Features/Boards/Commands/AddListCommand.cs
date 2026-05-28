using FluentValidation;
using KeepFocus.Application.Common;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.DTOs;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using MediatR;

namespace KeepFocus.Application.Features.Boards.Commands 
{
    public sealed record AddListCommand(Guid UserId, Guid BoardId, string Title) : IRequest<Result<ListDto>>;
    public sealed class AddListCommandValidator : AbstractValidator<AddListCommand>
    {
        public AddListCommandValidator() => RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
    public sealed class AddListHandler(IBoardRepository boards) : IRequestHandler<AddListCommand, Result<ListDto>>
    {
        public async Task<Result<ListDto>> Handle(AddListCommand cmd, CancellationToken ct)
        {
            var board = await boards.GetWithListsAsync(cmd.BoardId, ct);

            if (board is null) return Error.NotFound("Board not found.");
            if (board.UserId != cmd.UserId) return Error.Forbidden("Access denied.");
            var list = board.AddList(cmd.Title);

            await boards.AddListAsync(list, ct);
            await boards.SaveChangesAsync(ct);

            return new ListDto(list.Id, list.Title, list.Position, []);
        }
    }
}

