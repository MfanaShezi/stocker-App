using System;

namespace API.Entities;

public class PortfolioSummary
{
    public decimal TotalValue { get; set; }

    public decimal TotalGainLoss { get; set; }

    public decimal TotalGainLossPercentage { get; set; }

    public int TotalStocks { get; set; }

}
