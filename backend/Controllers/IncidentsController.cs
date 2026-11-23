using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NGMo.Api.Data;
using NGMo.Api.Models;

namespace NGMo.Api.Controllers;

[ApiController]
[Route("api/avisos")]
public class IncidentsController(NgmoDbContext db) : ControllerBase
{
    public sealed record CreateIncidentRequest(
        string TitolAvis,
        string Ubicacion,
        string Descripcion,
        int IdUser,
        int IdDelincuent);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Incidents
            .Include(item => item.User)
            .Include(item => item.Delincuent)
            .OrderByDescending(item => item.FechaCreacion)
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var incident = await db.Incidents
            .Include(item => item.User)
            .Include(item => item.Delincuent)
            .FirstOrDefaultAsync(item => item.IdAvisos == id);
        return incident is null ? NotFound() : Ok(incident);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateIncidentRequest request)
    {
        if (!await db.Users.AnyAsync(user => user.IdUser == request.IdUser))
        {
            return BadRequest(new { message = "El usuario no existe" });
        }
        if (!await db.Delincuentes.AnyAsync(item => item.IdDelincuent == request.IdDelincuent))
        {
            return BadRequest(new { message = "El delincuente no existe" });
        }

        var incident = new Incident
        {
            TitolAvis = request.TitolAvis.Trim(),
            Ubicacion = request.Ubicacion.Trim(),
            Descripcion = request.Descripcion.Trim(),
            FechaCreacion = DateTime.UtcNow,
            Verificado = false,
            IdUser = request.IdUser,
            IdDelincuent = request.IdDelincuent
        };
        db.Incidents.Add(incident);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = incident.IdAvisos }, incident);
    }

    [HttpPatch("{id:int}/verify")]
    public async Task<IActionResult> Verify(int id)
    {
        var incident = await db.Incidents.FindAsync(id);
        if (incident is null) return NotFound();

        incident.Verificado = true;
        await db.SaveChangesAsync();
        return Ok(incident);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var incident = await db.Incidents.FindAsync(id);
        if (incident is null) return NotFound();

        db.Incidents.Remove(incident);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
