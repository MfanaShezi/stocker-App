using System;
using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class User : IdentityUser<int>
{
    public InvestmentStyle? InvestmentStyle { get; set; }
    public RiskAppetite? RiskAppetite { get; set; }
    public InvestmentGoal? InvestmentGoal { get; set; }
    public WatchList? Watchlist { get; set; }

}

public enum InvestmentStyle
{
    Conservative,
    Moderate,
    Aggressive,
    Balanced
}

public enum RiskAppetite
{
    Low,
    Medium,
    High
}

public enum InvestmentGoal
{
    Retirement,
    Growth,
    Income
    
}
