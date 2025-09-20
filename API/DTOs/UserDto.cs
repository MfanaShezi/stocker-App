using System;
using API.Entities;

namespace API.DTOs;

public class UserDto
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Token { get; set; }

    public required InvestmentStyle InvestmentStyle { get; set; }
    public required InvestmentGoal InvestmentGoal { get; set; }

    public required RiskAppetite RiskAppetite { get; set; } 
}
