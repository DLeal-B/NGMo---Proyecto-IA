using Microsoft.EntityFrameworkCore;
using NGMo.Api.Models;
using System.Collections.Generic;

namespace NGMo.Api.Data;

public class NgmoDbContext(DbContextOptions<NgmoDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Delincuent> Delincuentes => Set<Delincuent>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<Session> Sessions => Set<Session>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .Property(user => user.Rol)
            .HasConversion<string>();

        modelBuilder.Entity<User>().HasKey(user => user.IdUser);
        modelBuilder.Entity<Delincuent>().HasKey(delincuent => delincuent.IdDelincuent);
        modelBuilder.Entity<Incident>().HasKey(incident => incident.IdAvisos);
        modelBuilder.Entity<Session>().HasKey(session => session.Id);
        modelBuilder.Entity<Session>().HasIndex(session => session.Token).IsUnique();
        modelBuilder.Entity<Session>()
            .HasOne(session => session.User)
            .WithMany()
            .HasForeignKey(session => session.IdUser)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Name)
            .IsUnique();

        modelBuilder.Entity<Incident>()
            .HasOne(incident => incident.User)
            .WithMany(user => user.Incidents)
            .HasForeignKey(incident => incident.IdUser)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Incident>()
            .HasOne(incident => incident.Delincuent)
            .WithMany(delincuent => delincuent.Incidents)
            .HasForeignKey(incident => incident.IdDelincuent)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<Delincuent>().ToTable("Delincuentes");
        modelBuilder.Entity<Incident>().ToTable("Avisos");
    }

    public static async Task SeedAsync(NgmoDbContext db)
    {
        var users = await db.Users.ToListAsync();

        if (users.Count == 0)
        {
            db.Users.AddRange(
                new User { Name = "admin", Contrasenya = "1234", Rol = Rol.Admin },
                new User { Name = "policia", Contrasenya = "1234", Rol = Rol.Policia },
                new User { Name = "user", Contrasenya = "1234", Rol = null });
        }
        else if (!users.Any(user => user.Name == "policia"))
        {
            db.Users.Add(new User
            {
                Name = "policia",
                Contrasenya = "1234",
                Rol = Rol.Policia
            });
        }
        await db.SaveChangesAsync();

        if (!await db.Delincuentes.AnyAsync())
        {
            db.Delincuentes.Add(
                new Delincuent { Name = "HustleHard" });
            await db.SaveChangesAsync();
        }

        if (!await db.Incidents.AnyAsync())
        {
            var admin = await db.Users.SingleAsync(user => user.Name == "admin");
            var police = await db.Users.SingleAsync(user => user.Name == "policia");
            var hustleHard = await db.Delincuentes.SingleAsync(item => item.Name == "HustleHard");
            db.Incidents.AddRange(
                new Incident
                {
                    TitolAvis = "Robo con fuerza", Type = "Robo",
                    Ubicacion = "Calle de Alcalá, Madrid", Descripcion = "Aviso de demostración",
                    Latitude = 40.4168, Longitude = -3.7038, FechaCreacion = DateTime.UtcNow.AddMinutes(-18),
                    Verificado = true, Severity = "Muy grave", IdUser = admin.IdUser, IdDelincuent = hustleHard.IdDelincuent
                },
                new Incident
                {
                    TitolAvis = "Hurto de pertenencias", Type = "Hurto",
                    Ubicacion = "Metro Sol, Madrid", Descripcion = "Aviso de demostración",
                    Latitude = 40.4185, Longitude = -3.6994, FechaCreacion = DateTime.UtcNow.AddHours(-1),
                    Verificado = false, Severity = "Leve", IdUser = admin.IdUser, IdDelincuent = hustleHard.IdDelincuent
                },
                new Incident
                {
                    TitolAvis = "Agresión en vía pública", Type = "Agresión",
                    Ubicacion = "Plaza Elíptica, Madrid", Descripcion = "Aviso de demostración",
                    Latitude = 40.385, Longitude = -3.719, FechaCreacion = DateTime.UtcNow.AddMinutes(-42),
                    Verificado = true, Severity = "Medio", IdUser = police.IdUser, IdDelincuent = hustleHard.IdDelincuent
                });
        }

        await db.SaveChangesAsync();
    }

    public static async Task UpgradeSchemaAsync(NgmoDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS Sessions (
                Id INTEGER NOT NULL CONSTRAINT PK_Sessions PRIMARY KEY AUTOINCREMENT,
                Token TEXT NOT NULL,
                CreatedAt TEXT NOT NULL,
                IdUser INTEGER NOT NULL,
                CONSTRAINT FK_Sessions_Users_IdUser FOREIGN KEY (IdUser) REFERENCES Users (IdUser) ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX IF NOT EXISTS IX_Sessions_Token ON Sessions (Token);
            """);
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText = "PRAGMA table_info(Avisos)";
        await db.Database.OpenConnectionAsync();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            columns.Add(reader.GetString(1));
        }

        var additions = new Dictionary<string, string>
        {
            ["Type"] = "TEXT NOT NULL DEFAULT 'Robo'",
            ["Latitude"] = "REAL NOT NULL DEFAULT 40.4168",
            ["Longitude"] = "REAL NOT NULL DEFAULT -3.7038",
            ["Severity"] = "TEXT NOT NULL DEFAULT 'Pendiente'"
        };
        foreach (var addition in additions.Where(item => !columns.Contains(item.Key)))
        {
            var statement = addition.Key switch
            {
                "Type" => "ALTER TABLE Avisos ADD COLUMN Type TEXT NOT NULL DEFAULT 'Robo'",
                "Latitude" => "ALTER TABLE Avisos ADD COLUMN Latitude REAL NOT NULL DEFAULT 40.4168",
                "Longitude" => "ALTER TABLE Avisos ADD COLUMN Longitude REAL NOT NULL DEFAULT -3.7038",
                "Severity" => "ALTER TABLE Avisos ADD COLUMN Severity TEXT NOT NULL DEFAULT 'Pendiente'",
                _ => throw new InvalidOperationException($"Columna no soportada: {addition.Key}")
            };
            await db.Database.ExecuteSqlRawAsync(statement);
        }
    }
}
