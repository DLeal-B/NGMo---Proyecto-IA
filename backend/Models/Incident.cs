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

    public DateTime FechaCreacion { get; set; }

    public bool Verificado { get; set; }

    public int IdUser { get; set; }
    public User? User { get; set; }

    public int IdDelincuent { get; set; }
    public Delincuent? Delincuent { get; set; }
}
