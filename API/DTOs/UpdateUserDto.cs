using System;
using API.Entities;

namespace API.DTOs;

public class UpdateUserDto
{
    public InvestmentStyle? InvestmentStyle { get; set; }
    public RiskAppetite? RiskAppetite { get; set; }
    public InvestmentGoal? InvestmentGoal { get; set; }
    
}