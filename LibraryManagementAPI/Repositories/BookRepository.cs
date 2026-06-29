using LibraryManagementApi.Entities;
using LibraryManagementSystem.Data;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementApi.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Book>> GetAllAsync()
    {
        return await _context.Books.ToListAsync();
    }

    public async Task<Book?> GetByIdAsync(string id)
    {
        return await _context.Books.FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<List<Book>> GetByAuthorAsync(string author)
    {
        return await _context.Books.Where(b => b.Author.Contains(author)).ToListAsync();
    }

    public async Task<List<Book>> GetByCategoryAsync(string category)
    {
        return await _context.Books.Where(b => b.Category == category).ToListAsync();
    }

    public async Task<Book?> GetByIsbnAsync(string isbn)
    {
        return await _context.Books.FirstOrDefaultAsync(b => b.Isbn == isbn);
    }

    public async Task<int> GetCountAsync()
    {
        return await _context.Books.SumAsync(b => b.TotalCopies);
    }

    public async Task<int> GetAvailableCountAsync()
    {
        return await _context.Books.SumAsync(b => b.AvailableCopies);
    }

    public async Task<Book> AddAsync(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task<Book?> UpdateAsync(string id, Action<Book> updateAction)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id);
        if (book is null)
            return null;

        updateAction(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id);
        if (book is null)
            return false;

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return true;
    }
}
