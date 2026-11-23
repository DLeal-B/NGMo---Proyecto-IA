using System.ComponentModel.DataAnnotations;

namespace NGMo.Api.Models;

public class Delincuent
{
    public int IdDelincuent { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}
