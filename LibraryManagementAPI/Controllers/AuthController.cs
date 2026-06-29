using LibraryManagementApi.DTOs;
using LibraryManagementApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var user = await _authService.RegisterAsync(dto.FullName, dto.Email, dto.Password);
        if (user is null)
            return Conflict(new { message = "A user with this email already exists." });

        var token = _authService.GenerateJwtToken(user);
        return Ok(
            new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
            }
        );
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _authService.LoginAsync(dto.Email, dto.Password);
        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = _authService.GenerateJwtToken(user);
        return Ok(
            new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
            }
        );
    }
}
