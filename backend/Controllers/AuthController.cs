using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NGMo.Api.Data;
using NGMo.Api.Models;

namespace NGMo.Api.Controllers;

[ApiController]
[Route("api")]
public class AuthController(NgmoDbContext db) : ControllerBase
{
    public sealed record LoginRequest(string Name, string Contrasenya);
    public sealed record RegisterRequest(string Name, string Contrasenya);

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(item =>
            item.Name == request.Name.Trim().ToLower() &&
            item.Contrasenya == request.Contrasenya);

        if (user is null) return Unauthorized(new { message = "Usuario o contraseña incorrectos" });
        return await CreateSession(user);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var name = request.Name.Trim().ToLower();
        if (name.Length is < 3 or > 100)
        {
            return BadRequest(new { message = "El usuario debe tener entre 3 y 100 caracteres" });
        }
        if (await db.Users.AnyAsync(user => user.Name == name))
        {
            return Conflict(new { message = "Ese usuario ya existe" });
        }

        var user = new User
        {
            Name = name,
            Contrasenya = request.Contrasenya,
            Rol = null
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return await CreateSession(user);
    }

    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        var token = Request.Cookies["ngmo-session"];
        var session = token is null ? null : await db.Sessions.Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Token == token);
        return session?.User is null
            ? Unauthorized()
            : Ok(new { id = session.User.IdUser, name = session.User.Name, rol = session.User.Rol });
    }

    [HttpDelete("session")]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["ngmo-session"];
        if (token is not null)
        {
            var session = await db.Sessions.FirstOrDefaultAsync(item => item.Token == token);
            if (session is not null) db.Sessions.Remove(session);
            await db.SaveChangesAsync();
        }
        Response.Cookies.Delete("ngmo-session");
        return NoContent();
    }

    private async Task<IActionResult> CreateSession(User user)
    {
        var token = Guid.NewGuid().ToString("N");
        db.Sessions.Add(new Session { Token = token, IdUser = user.IdUser, CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        Response.Cookies.Append("ngmo-session", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            IsEssential = true
        });
        return Ok(new { id = user.IdUser, name = user.Name, rol = user.Rol });
    }
}
