using System;

namespace API.Entities;

public class Stock
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Symbol { get; set; }
    public string? Description { get; set; }
    public required bool isETF { get; set; } = false;

    public required string Exchange { get; set; } // e.g., NYSE, NASDAQ

    public string? Category { get; set; }
    public string? Sector { get; set; }
    public string? Region { get; set; }
    public string? AssetClass { get; set; }
    public string? FundFamily { get; set; }
    public decimal? ExpenseRatio { get; set; }
    public decimal? TotalAssets { get; set; }
    public decimal? PeRatio { get; set; }
    public decimal? DividendYield { get; set; }
    public decimal? SharePrice { get; set; }
    public bool hasDividends { get; set; } = false;
    public decimal? MarketCap { get; set; }
    public decimal? TotalDebt { get; set; }

    public decimal? ROE { get; set; } // Return on Equity
    public decimal? ROA { get; set; } // Return on Assets
    public decimal? PriceToBook { get; set; } // Price-to-Book Ratio
    public decimal? BookValue { get; set; } // Book Value
    public decimal? DividendRate { get; set; } // Dividend Rate
    public decimal? fiftyTwoWeekHigh { get; set; }
    public decimal? fiftyTwoWeekLow { get; set; }
    public decimal? ChangePercentage { get; set; }

    public ICollection<StockPrice> Prices { get; set; } = new List<StockPrice>();
    public ICollection<WatchListStock> WatchListStocks { get; set; } = new List<WatchListStock>(); // Many-to-Many relationship
    public ICollection<StockNews> News { get; set; } = new List<StockNews>();
    public ICollection<StockDividend> Dividends { get; set; } = new List<StockDividend>(); // One-to-Many relationship
}
