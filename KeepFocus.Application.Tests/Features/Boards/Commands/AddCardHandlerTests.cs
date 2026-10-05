using FluentAssertions;
using KeepFocus.Application.Common.Errors;
using KeepFocus.Application.Features.Boards.Commands;
using KeepFocus.Domain.Entities;
using KeepFocus.Domain.Interfaces;
using NSubstitute;

namespace KeepFocus.Application.Tests.Features.Boards.Commands;

public class AddCardHandlerTests
{
    [Fact]
    public async Task Handle_WhenBoardDoesNotExist_ReturnsNotFound()
    {
        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Board?)null);

        var handler = new AddCardHandler(repository);
        var command = new AddCardCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "New card");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
        await repository.DidNotReceive().AddCardAsync(Arg.Any<Card>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenBoardBelongsToAnotherUser_ReturnsForbidden()
    {
        var board = Board.Create(userId: Guid.NewGuid(), title: "My board");
        var list = board.AddList("To do");

        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(board.Id, Arg.Any<CancellationToken>()).Returns(board);

        var handler = new AddCardHandler(repository);
        var someoneElseId = Guid.NewGuid();
        var command = new AddCardCommand(someoneElseId, board.Id, list.Id, "New card");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error!.Type.Should().Be(ErrorType.Forbidden);
        list.Cards.Should().BeEmpty();
        await repository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenUserOwnsBoard_AddsCardAndSaves()
    {
        var board = Board.Create(userId: Guid.NewGuid(), title: "My board");
        var list = board.AddList("To do");

        var repository = Substitute.For<IBoardRepository>();
        repository.GetWithListsAsync(board.Id, Arg.Any<CancellationToken>()).Returns(board);

        var handler = new AddCardHandler(repository);
        var command = new AddCardCommand(board.UserId, board.Id, list.Id, "New card");

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Title.Should().Be("New card");
        list.Cards.Should().ContainSingle(c => c.Id == result.Value.Id);
        await repository.Received(1).AddCardAsync(Arg.Is<Card>(c => c.Id == result.Value.Id), Arg.Any<CancellationToken>());
        await repository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
