using LibraryManagementApi.Entities;
using LibraryManagementApi.Services;
using LibraryManagementSystem.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace LibraryManagementAPI.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    { "Jwt:Key", "ThisIsASecretKeyForTestingPurposesOnly123!" },
                    { "Jwt:Issuer", "TestIssuer" },
                    { "Jwt:Audience", "TestAudience" },
                    { "Jwt:ExpiresInHours", "1" },
                }
            )
            .Build();

        _authService = new AuthService(_context, configuration);
    }

    [Fact]
    public async Task RegisterAsync_NewUser_ReturnsUser()
    {
        var result = await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        Assert.NotNull(result);
        Assert.Equal("John Doe", result.FullName);
        Assert.Equal("john@test.com", result.Email);
        Assert.NotEqual("password123", result.PasswordHash);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ReturnsNull()
    {
        await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        var result = await _authService.RegisterAsync("Jane Doe", "john@test.com", "password456");

        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_HashesPassword()
    {
        var result = await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        Assert.NotNull(result);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", result.PasswordHash));
    }

    [Fact]
    public async Task RegisterAsync_SetsDefaultRole()
    {
        var result = await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        Assert.NotNull(result);
        Assert.Equal("User", result.Role);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsUser()
    {
        await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        var result = await _authService.LoginAsync("john@test.com", "password123");

        Assert.NotNull(result);
        Assert.Equal("john@test.com", result.Email);
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ReturnsNull()
    {
        await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        var result = await _authService.LoginAsync("wrong@test.com", "password123");

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsNull()
    {
        await _authService.RegisterAsync("John Doe", "john@test.com", "password123");

        var result = await _authService.LoginAsync("john@test.com", "wrongpassword");

        Assert.Null(result);
    }

    [Fact]
    public void GenerateJwtToken_ReturnsValidToken()
    {
        var user = new User
        {
            Id = 1,
            FullName = "John Doe",
            Email = "john@test.com",
            PasswordHash = "hash",
            Role = "User",
        };

        var token = _authService.GenerateJwtToken(user);

        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public void GenerateJwtToken_ContainsExpectedClaims()
    {
        var user = new User
        {
            Id = 1,
            FullName = "John Doe",
            Email = "john@test.com",
            PasswordHash = "hash",
            Role = "Admin",
        };

        var token = _authService.GenerateJwtToken(user);
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Contains(jwtToken.Claims, c => c.Value == "john@test.com");
        Assert.Contains(jwtToken.Claims, c => c.Value == "Admin");
        Assert.Contains(jwtToken.Claims, c => c.Value == "John Doe");
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
