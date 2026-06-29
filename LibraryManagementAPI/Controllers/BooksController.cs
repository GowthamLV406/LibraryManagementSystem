using LibraryManagementApi.DTOs;
using LibraryManagementApi.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookRepository _bookRepository;

    public BooksController(IBookRepository bookRepository)
    {
        _bookRepository = bookRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<Book>>> GetAll()
    {
        var books = await _bookRepository.GetAllAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetById(string id)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book is null)
            return NotFound();
        return Ok(book);
    }

    [HttpGet("author/{author}")]
    public async Task<ActionResult<List<Book>>> GetByAuthor(string author)
    {
        var books = await _bookRepository.GetByAuthorAsync(author);
        return Ok(books);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<Book>>> GetByCategory(string category)
    {
        var books = await _bookRepository.GetByCategoryAsync(category);
        return Ok(books);
    }

    [HttpGet("isbn/{isbn}")]
    public async Task<ActionResult<Book>> GetByIsbn(string isbn)
    {
        var book = await _bookRepository.GetByIsbnAsync(isbn);
        if (book is null)
            return NotFound();
        return Ok(book);
    }

    [HttpGet("count")]
    public async Task<ActionResult<object>> GetCount()
    {
        var total = await _bookRepository.GetCountAsync();
        var available = await _bookRepository.GetAvailableCountAsync();
        return Ok(new { TotalCopies = total, AvailableCopies = available });
    }

    [HttpPost]
    public async Task<ActionResult<Book>> Create(CreateBookDto dto)
    {
        var book = new Book(
            id: Guid.NewGuid().ToString(),
            title: dto.Title,
            author: dto.Author,
            isbn: dto.Isbn,
            publisher: dto.Publisher,
            category: dto.Category,
            language: dto.Language,
            shelfLocation: dto.ShelfLocation,
            description: dto.Description,
            publishedDate: dto.PublishedDate,
            createdAt: DateTime.UtcNow,
            updatedAt: DateTime.UtcNow,
            totalCopies: dto.TotalCopies,
            availableCopies: dto.TotalCopies
        );

        var created = await _bookRepository.AddAsync(book);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Book>> Update(string id, UpdateBookDto dto)
    {
        var updated = await _bookRepository.UpdateAsync(
            id,
            book =>
            {
                if (dto.Title is not null)
                    book.Title = dto.Title;
                if (dto.Author is not null)
                    book.Author = dto.Author;
                if (dto.Publisher is not null)
                    book.Publisher = dto.Publisher;
                if (dto.Category is not null)
                    book.Category = dto.Category;
                if (dto.Language is not null)
                    book.Language = dto.Language;
                if (dto.ShelfLocation is not null)
                    book.ShelfLocation = dto.ShelfLocation;
                if (dto.Description is not null)
                    book.Description = dto.Description;
                if (dto.PublishedDate.HasValue)
                    book.PublishedDate = dto.PublishedDate.Value;
                if (dto.TotalCopies.HasValue)
                    book.TotalCopies = dto.TotalCopies.Value;
                if (dto.AvailableCopies.HasValue)
                    book.AvailableCopies = dto.AvailableCopies.Value;
            }
        );

        if (updated is null)
            return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var deleted = await _bookRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
