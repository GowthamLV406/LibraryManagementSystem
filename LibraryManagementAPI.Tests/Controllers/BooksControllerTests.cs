using LibraryManagementApi.Controllers;
using LibraryManagementApi.DTOs;
using LibraryManagementApi.Entities;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LibraryManagementAPI.Tests.Controllers;

public class BooksControllerTests
{
    private readonly Mock<IBookRepository> _mockRepo;
    private readonly BooksController _controller;

    public BooksControllerTests()
    {
        _mockRepo = new Mock<IBookRepository>();
        _controller = new BooksController(_mockRepo.Object);
    }

    private Book CreateTestBook(string id = "1", string title = "Test Book")
    {
        return new Book(
            id: id,
            title: title,
            author: "Test Author",
            isbn: "978-123",
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

    // --- GetAll ---

    [Fact]
    public async Task GetAll_ReturnsOkWithBooks()
    {
        var books = new List<Book> { CreateTestBook("1"), CreateTestBook("2", "Book 2") };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(books);

        var result = await _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBooks = Assert.IsType<List<Book>>(okResult.Value);
        Assert.Equal(2, returnedBooks.Count);
    }

    [Fact]
    public async Task GetAll_EmptyList_ReturnsOk()
    {
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Book>());

        var result = await _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBooks = Assert.IsType<List<Book>>(okResult.Value);
        Assert.Empty(returnedBooks);
    }

    // --- GetById ---

    [Fact]
    public async Task GetById_ExistingId_ReturnsOkWithBook()
    {
        var book = CreateTestBook("1");
        _mockRepo.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(book);

        var result = await _controller.GetById("1");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBook = Assert.IsType<Book>(okResult.Value);
        Assert.Equal("1", returnedBook.Id);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        _mockRepo.Setup(r => r.GetByIdAsync("999")).ReturnsAsync((Book?)null);

        var result = await _controller.GetById("999");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    // --- GetByAuthor ---

    [Fact]
    public async Task GetByAuthor_ReturnsOkWithBooks()
    {
        var books = new List<Book> { CreateTestBook("1") };
        _mockRepo.Setup(r => r.GetByAuthorAsync("Test Author")).ReturnsAsync(books);

        var result = await _controller.GetByAuthor("Test Author");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBooks = Assert.IsType<List<Book>>(okResult.Value);
        Assert.Single(returnedBooks);
    }

    // --- GetByCategory ---

    [Fact]
    public async Task GetByCategory_ReturnsOkWithBooks()
    {
        var books = new List<Book> { CreateTestBook("1") };
        _mockRepo.Setup(r => r.GetByCategoryAsync("Fiction")).ReturnsAsync(books);

        var result = await _controller.GetByCategory("Fiction");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedBooks = Assert.IsType<List<Book>>(okResult.Value);
        Assert.Single(returnedBooks);
    }

    // --- GetByIsbn ---

    [Fact]
    public async Task GetByIsbn_ExistingIsbn_ReturnsOkWithBook()
    {
        var book = CreateTestBook("1");
        _mockRepo.Setup(r => r.GetByIsbnAsync("978-123")).ReturnsAsync(book);

        var result = await _controller.GetByIsbn("978-123");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.IsType<Book>(okResult.Value);
    }

    [Fact]
    public async Task GetByIsbn_NonExistingIsbn_ReturnsNotFound()
    {
        _mockRepo.Setup(r => r.GetByIsbnAsync("000-000")).ReturnsAsync((Book?)null);

        var result = await _controller.GetByIsbn("000-000");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    // --- GetCount ---

    [Fact]
    public async Task GetCount_ReturnsOkWithCounts()
    {
        _mockRepo.Setup(r => r.GetCountAsync()).ReturnsAsync(10);
        _mockRepo.Setup(r => r.GetAvailableCountAsync()).ReturnsAsync(6);

        var result = await _controller.GetCount();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    // --- Create ---

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        var dto = new CreateBookDto(
            "New Book",
            "Author",
            "978-999",
            "Publisher",
            "Fiction",
            "English",
            "B2",
            "Description",
            new DateTime(2023, 6, 1),
            10
        );

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Book>())).ReturnsAsync((Book b) => b);

        var result = await _controller.Create(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedBook = Assert.IsType<Book>(createdResult.Value);
        Assert.Equal("New Book", returnedBook.Title);
        Assert.Equal(10, returnedBook.TotalCopies);
        Assert.Equal(10, returnedBook.AvailableCopies);
    }

    // --- Update ---

    [Fact]
    public async Task Update_ExistingBook_ReturnsOkWithUpdatedBook()
    {
        var book = CreateTestBook("1");
        _mockRepo.Setup(r => r.UpdateAsync("1", It.IsAny<Action<Book>>())).ReturnsAsync(book);

        var dto = new UpdateBookDto(
            "Updated Title",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );

        var result = await _controller.Update("1", dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.IsType<Book>(okResult.Value);
    }

    [Fact]
    public async Task Update_NonExistingBook_ReturnsNotFound()
    {
        _mockRepo
            .Setup(r => r.UpdateAsync("999", It.IsAny<Action<Book>>()))
            .ReturnsAsync((Book?)null);

        var dto = new UpdateBookDto(
            "Updated Title",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );

        var result = await _controller.Update("999", dto);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    // --- Delete ---

    [Fact]
    public async Task Delete_ExistingBook_ReturnsNoContent()
    {
        _mockRepo.Setup(r => r.DeleteAsync("1")).ReturnsAsync(true);

        var result = await _controller.Delete("1");

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_NonExistingBook_ReturnsNotFound()
    {
        _mockRepo.Setup(r => r.DeleteAsync("999")).ReturnsAsync(false);

        var result = await _controller.Delete("999");

        Assert.IsType<NotFoundResult>(result);
    }
}
