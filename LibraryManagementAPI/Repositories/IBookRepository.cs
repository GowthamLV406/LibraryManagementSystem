using LibraryManagementApi.Entities;

public interface IBookRepository
{
    Task<List<Book>> GetAllAsync();
    Task<Book?> GetByIdAsync(string id);
    Task<List<Book>> GetByAuthorAsync(string author);
    Task<List<Book>> GetByCategoryAsync(string category);
    Task<Book?> GetByIsbnAsync(string isbn);
    Task<int> GetCountAsync();
    Task<int> GetAvailableCountAsync();
    Task<Book> AddAsync(Book book);
    Task<Book?> UpdateAsync(string id, Action<Book> updateAction);
    Task<bool> DeleteAsync(string id);
}
