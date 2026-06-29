using LibraryManagementApi.Entities;

namespace LibraryManagementApi.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string fullName, string email, string password);
    Task<User?> LoginAsync(string email, string password);
    string GenerateJwtToken(User user);
}
