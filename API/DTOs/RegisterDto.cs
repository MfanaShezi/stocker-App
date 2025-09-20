using System;
using System.ComponentModel.DataAnnotations;
using API.Entities;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
    [Required]
    public InvestmentStyle InvestmentStyle { get; set; }
    [Required]
    public InvestmentGoal InvestmentGoal { get; set; }
    [Required]
    public RiskAppetite RiskAppetite { get; set; }
}
