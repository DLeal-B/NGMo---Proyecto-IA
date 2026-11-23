using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NGMo.Api.Data;
using NGMo.Api.Models;

namespace NGMo.Api.Controllers;

[ApiController]
[Route("api/avisos")]
public class IncidentsController(NgmoDbContext db) : ControllerBase
{
    public sealed record IncidentResponse(
        int IdAvisos,
        string TitolAvis,
        string Ubicacion,
        string Descripcion,
        string Type,
        double Latitude,
        double Longitude,
        string Severity,
        DateTime FechaCreacion,
        bool Verificado,
        int IdUser,
        string UserName,
        int IdDelincuent,
        string DelincuentName);

    public sealed record CreateIncidentRequest(
        string TitolAvis,
        string Ubicacion,
        string Descripcion,
        string Type,
        double Latitude,
        double Longitude,
        string Severity,
        int IdUser,
        int IdDelincuent);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Incidents
            .Include(item => item.User)
            .Include(item => item.Delincuent)
            .OrderByDescending(item => item.FechaCreacion)
            .Select(item => ToResponse(item))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var incident = await db.Incidents
            .Include(item => item.User)
            .Include(item => item.Delincuent)
            .Select(item => ToResponse(item))
            .FirstOrDefaultAsync(item => item.IdAvisos == id);
        return incident is null ? NotFound() : Ok(incident);
    }

    private static IncidentResponse ToResponse(Incident item) => new(
        item.IdAvisos,
        item.TitolAvis,
        item.Ubicacion,
        item.Descripcion,
        item.Type,
        item.Latitude,
        item.Longitude,
        item.Severity,
        item.FechaCreacion,
        item.Verificado,
        item.IdUser,
        item.User!.Name,
        item.IdDelincuent,
        item.Delincuent!.Name);

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
            Type = request.Type.Trim(),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Severity = request.Severity.Trim(),
            FechaCreacion = DateTime.UtcNow,
            Verificado = false,
            IdUser = request.IdUser,
            IdDelincuent = request.IdDelincuent
        };
        db.Incidents.Add(incident);
        await db.SaveChangesAsync();
        return await GetById(incident.IdAvisos);
    }

    [HttpPatch("{id:int}/verify")]
    public async Task<IActionResult> Verify(int id)
    {
        var incident = await db.Incidents.FindAsync(id);
        if (incident is null) return NotFound();

        incident.Verificado = true;
        await db.SaveChangesAsync();
        return await GetById(incident.IdAvisos);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateIncidentRequest request)
    {
        var incident = await db.Incidents.FindAsync(id);
        if (incident is null) return NotFound();
        if (!await db.Users.AnyAsync(user => user.IdUser == request.IdUser)
            || !await db.Delincuentes.AnyAsync(item => item.IdDelincuent == request.IdDelincuent))
        {
            return BadRequest(new { message = "Las relaciones indicadas no existen" });
        }

        incident.TitolAvis = request.TitolAvis.Trim();
        incident.Type = request.Type.Trim();
        incident.Ubicacion = request.Ubicacion.Trim();
        incident.Descripcion = request.Descripcion.Trim();
        incident.Latitude = request.Latitude;
        incident.Longitude = request.Longitude;
        incident.Severity = request.Severity.Trim();
        incident.IdUser = request.IdUser;
        incident.IdDelincuent = request.IdDelincuent;
        await db.SaveChangesAsync();
        return await GetById(incident.IdAvisos);
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
