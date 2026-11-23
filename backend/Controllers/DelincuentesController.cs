using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NGMo.Api.Data;
using NGMo.Api.Models;

namespace NGMo.Api.Controllers;

[ApiController]
[Route("api/delincuentes")]
public class DelincuentesController(NgmoDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Delincuentes.OrderBy(item => item.Name).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(Delincuent delincuent)
    {
        if (string.IsNullOrWhiteSpace(delincuent.Name))
        {
            return BadRequest(new { message = "El nombre es obligatorio" });
        }

        db.Delincuentes.Add(delincuent);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = delincuent.IdDelincuent }, delincuent);
    }
}
