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

        return user is null
            ? Unauthorized(new { message = "Usuario o contraseña incorrectos" })
            : Ok(new { id = user.IdUser, name = user.Name, rol = user.Rol });
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
        return Ok(new { id = user.IdUser, name = user.Name, rol = user.Rol });
    }
}
