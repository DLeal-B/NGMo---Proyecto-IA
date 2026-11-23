using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NGMo.Api.Data;

namespace NGMo.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(NgmoDbContext db) : ControllerBase
{
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveUsers()
    {
        var users = await db.Users
            .Where(user => user.Rol != "policia")
            .Select(user => new
            {
                user.IdUser,
                user.Name,
                user.Rol,
                Avisos = user.Incidents.Count
            })
            .OrderByDescending(user => user.Avisos)
            .ThenBy(user => user.Name)
            .ToListAsync();

        return Ok(users);
    }
}
