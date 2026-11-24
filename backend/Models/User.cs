using System.ComponentModel.DataAnnotations;

namespace NGMo.Api.Models;

public class User
{
    public int IdUser { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Contrasenya { get; set; } = string.Empty;

    [MaxLength(20)]
    public Rol? Rol { get; set; }

    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}

public enum Rol
{
    Admin,
    Policia,
    User
}
