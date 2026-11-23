using Microsoft.EntityFrameworkCore;
using NGMo.Api.Models;

namespace NGMo.Api.Data;

public class NgmoDbContext(DbContextOptions<NgmoDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Delincuent> Delincuentes => Set<Delincuent>();
    public DbSet<Incident> Incidents => Set<Incident>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(user => user.IdUser);
        modelBuilder.Entity<Delincuent>().HasKey(delincuent => delincuent.IdDelincuent);
        modelBuilder.Entity<Incident>().HasKey(incident => incident.IdAvisos);

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
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new User { Name = "admin", Contrasenya = "1234", Rol = "admin" },
                new User { Name = "policia", Contrasenya = "1234", Rol = "policia" });
        }

        if (!await db.Delincuentes.AnyAsync())
        {
            db.Delincuentes.AddRange(
                new Delincuent { Name = "HustleHard" },
                new Delincuent { Name = "Desconegut" },
                new Delincuent { Name = "Persona en investigació" });
        }

        await db.SaveChangesAsync();
    }
}
