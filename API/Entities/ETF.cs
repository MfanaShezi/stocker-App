using System;

namespace API.Entities;

public class ETF
{
    public int Id { get; set; }
    public required string Symbol { get; set; }
    public required string Name { get; set; }
    public string? Category { get; set; }
    public string? Sector { get; set; }
    public string? Region { get; set; }
    public string? AssetClass { get; set; }
    public string? FundFamily { get; set; }
    public decimal ExpenseRatio { get; set; }
    public decimal TotalAssets { get; set; }
    public decimal? PeRatio { get; set; }


}
