using LibraryManagementApi.Entities;
using LibraryManagementApi.Repositories;
using LibraryManagementSystem.Data;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementAPI.Tests.Repositories;

public class BookRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly BookRepository _repository;

    public BookRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _repository = new BookRepository(_context);
    }

    private Book CreateTestBook(
        string id = "1",
        string title = "Test Book",
        string author = "Test Author"
    )
    {
        return new Book(
            id: id,
            title: title,
            author: author,
            isbn: $"978-{id}",
            publisher: "Test Publisher",
            category: "Fiction",
            language: "English",
            shelfLocation: "A1",
            description: "A test book",
            publishedDate: new DateTime(2023, 1, 1),
            createdAt: DateTime.UtcNow,
            updatedAt: DateTime.UtcNow,
            totalCopies: 5,
            availableCopies: 3
        );
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllBooks()
    {
        _context.Books.AddRange(CreateTestBook("1"), CreateTestBook("2", "Second Book"));
        await _context.SaveChangesAsync();

        var result = await _repository.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetAllAsync_EmptyDatabase_ReturnsEmptyList()
    {
        var result = await _repository.GetAllAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsBook()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync("1");

        Assert.NotNull(result);
        Assert.Equal("Test Book", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        var result = await _repository.GetByIdAsync("non-existent");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByAuthorAsync_MatchingAuthor_ReturnsBooks()
    {
        _context.Books.AddRange(
            CreateTestBook("1", "Book 1", "John Smith"),
            CreateTestBook("2", "Book 2", "John Doe"),
            CreateTestBook("3", "Book 3", "Jane Doe")
        );
        await _context.SaveChangesAsync();

        var result = await _repository.GetByAuthorAsync("John");

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByAuthorAsync_NoMatch_ReturnsEmptyList()
    {
        _context.Books.Add(CreateTestBook("1", "Book 1", "John Smith"));
        await _context.SaveChangesAsync();

        var result = await _repository.GetByAuthorAsync("Unknown");

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByCategoryAsync_MatchingCategory_ReturnsBooks()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByCategoryAsync("Fiction");

        Assert.Single(result);
    }

    [Fact]
    public async Task GetByCategoryAsync_NoMatch_ReturnsEmptyList()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByCategoryAsync("Science");

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByIsbnAsync_ExistingIsbn_ReturnsBook()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIsbnAsync("978-1");

        Assert.NotNull(result);
        Assert.Equal("Test Book", result.Title);
    }

    [Fact]
    public async Task GetByIsbnAsync_NonExistingIsbn_ReturnsNull()
    {
        var result = await _repository.GetByIsbnAsync("000-000");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCountAsync_ReturnsTotalCopiesSum()
    {
        _context.Books.AddRange(CreateTestBook("1"), CreateTestBook("2"));
        await _context.SaveChangesAsync();

        var result = await _repository.GetCountAsync();

        Assert.Equal(10, result); // 5 + 5
    }

    [Fact]
    public async Task GetAvailableCountAsync_ReturnsAvailableCopiesSum()
    {
        _context.Books.AddRange(CreateTestBook("1"), CreateTestBook("2"));
        await _context.SaveChangesAsync();

        var result = await _repository.GetAvailableCountAsync();

        Assert.Equal(6, result); // 3 + 3
    }

    [Fact]
    public async Task AddAsync_AddsBookToDatabase()
    {
        var book = CreateTestBook("1");

        var result = await _repository.AddAsync(book);

        Assert.Equal("1", result.Id);
        Assert.Equal(1, await _context.Books.CountAsync());
    }

    [Fact]
    public async Task UpdateAsync_ExistingBook_UpdatesAndReturnsBook()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.UpdateAsync("1", b => b.Title = "Updated Title");

        Assert.NotNull(result);
        Assert.Equal("Updated Title", result.Title);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingBook_ReturnsNull()
    {
        var result = await _repository.UpdateAsync("non-existent", b => b.Title = "Updated");

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_ExistingBook_ReturnsTrueAndRemoves()
    {
        var book = CreateTestBook("1");
        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        var result = await _repository.DeleteAsync("1");

        Assert.True(result);
        Assert.Equal(0, await _context.Books.CountAsync());
    }

    [Fact]
    public async Task DeleteAsync_NonExistingBook_ReturnsFalse()
    {
        var result = await _repository.DeleteAsync("non-existent");

        Assert.False(result);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
