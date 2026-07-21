using FluentAssertions;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.Commands;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using NSubstitute;

namespace KeepFocus.Application.Tests.Features.Boards.Commands;

public class RenameListHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserOwnsBoard_RenamesListAndSaves()
    {
        var board = Board.Create(userId: Guid.NewGuid(), title: "My board");
        var list = board.AddList("Old title");

        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(board.Id, Arg.Any<CancellationToken>()).Returns(board);

        var handler = new RenameListHandler(repository);
        var command = new RenameListCommand(board.UserId, board.Id, list.Id, "New title");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        list.Title.Should().Be("New title");
        await repository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenBoardDoesNotExist_ReturnsNotFound()
    {
        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Board?)null);

        var handler = new RenameListHandler(repository);
        var command = new RenameListCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "New title");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Handle_WhenBoardBelongsToAnotherUser_ReturnsForbidden()
    {
        var board = Board.Create(userId: Guid.NewGuid(), title: "My board");
        var list = board.AddList("Old title");

        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(board.Id, Arg.Any<CancellationToken>()).Returns(board);

        var handler = new RenameListHandler(repository);
        var someoneElseId = Guid.NewGuid();
        var command = new RenameListCommand(someoneElseId, board.Id, list.Id, "New title");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error!.Type.Should().Be(ErrorType.Forbidden);
        list.Title.Should().Be("Old title");
    }
}
