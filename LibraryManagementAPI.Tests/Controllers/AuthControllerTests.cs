using LibraryManagementApi.Controllers;
using LibraryManagementApi.DTOs;
using LibraryManagementApi.Entities;
using LibraryManagementApi.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LibraryManagementAPI.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Register_NewUser_ReturnsOkWithToken()
    {
        var dto = new RegisterDto
        {
            FullName = "John Doe",
            Email = "john@test.com",
            Password = "password123",
        };
        var user = new User
        {
            Id = 1,
            FullName = "John Doe",
            Email = "john@test.com",
            PasswordHash = "hash",
            Role = "User",
        };

        _mockAuthService
            .Setup(s => s.RegisterAsync(dto.FullName, dto.Email, dto.Password))
            .ReturnsAsync(user);
        _mockAuthService.Setup(s => s.GenerateJwtToken(user)).Returns("test-token");

        var result = await _controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal("test-token", response.Token);
        Assert.Equal("john@test.com", response.Email);
        Assert.Equal("John Doe", response.FullName);
        Assert.Equal("User", response.Role);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        var dto = new RegisterDto
        {
            FullName = "John Doe",
            Email = "john@test.com",
            Password = "password123",
        };

        _mockAuthService
            .Setup(s => s.RegisterAsync(dto.FullName, dto.Email, dto.Password))
            .ReturnsAsync((User?)null);

        var result = await _controller.Register(dto);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        var dto = new LoginDto { Email = "john@test.com", Password = "password123" };
        var user = new User
        {
            Id = 1,
            FullName = "John Doe",
            Email = "john@test.com",
            PasswordHash = "hash",
            Role = "User",
        };

        _mockAuthService.Setup(s => s.LoginAsync(dto.Email, dto.Password)).ReturnsAsync(user);
        _mockAuthService.Setup(s => s.GenerateJwtToken(user)).Returns("test-token");

        var result = await _controller.Login(dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal("test-token", response.Token);
        Assert.Equal("john@test.com", response.Email);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var dto = new LoginDto { Email = "john@test.com", Password = "wrongpassword" };

        _mockAuthService
            .Setup(s => s.LoginAsync(dto.Email, dto.Password))
            .ReturnsAsync((User?)null);

        var result = await _controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_CallsAuthServiceWithCorrectParameters()
    {
        var dto = new RegisterDto
        {
            FullName = "John Doe",
            Email = "john@test.com",
            Password = "password123",
        };

        _mockAuthService
            .Setup(s => s.RegisterAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        await _controller.Register(dto);

        _mockAuthService.Verify(
            s => s.RegisterAsync("John Doe", "john@test.com", "password123"),
            Times.Once
        );
    }

    [Fact]
    public async Task Login_CallsAuthServiceWithCorrectParameters()
    {
        var dto = new LoginDto { Email = "john@test.com", Password = "password123" };

        _mockAuthService
            .Setup(s => s.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        await _controller.Login(dto);

        _mockAuthService.Verify(s => s.LoginAsync("john@test.com", "password123"), Times.Once);
    }
}
