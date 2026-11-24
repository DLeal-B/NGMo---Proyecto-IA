using System.ComponentModel.DataAnnotations;

namespace NGMo.Api.Models;

public class Incident
{
    public int IdAvisos { get; set; }

    [Required]
    [MaxLength(200)]
    public string TitolAvis { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Ubicacion { get; set; } = string.Empty;

    [Required]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    [MaxLength(50)]
    public string Severity { get; set; } = "Pendiente";

    public DateTime FechaCreacion { get; set; }

    public bool Verificado { get; set; }

    public int IdUser { get; set; }
    public User? User { get; set; }

    public int IdDelincuent { get; set; }
    public Delincuent? Delincuent { get; set; }
}
