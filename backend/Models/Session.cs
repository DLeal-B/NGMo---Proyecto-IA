namespace NGMo.Api.Models;

public class Session
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int IdUser { get; set; }
    public User? User { get; set; }
}
