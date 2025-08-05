using System;
using API.Entities;

namespace API.DTOs;

public class StockDto
{
    public int Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
     public required string Exchange { get; set; }
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? Sector { get; set; }
    public decimal? SharePrice { get; set; }
    public DateTime? LastUpdated { get; set; }
    public string? Website { get; set; }
    public bool hasDividends { get; set; } = false;
    public decimal? MarketCap { get; set; }
    public decimal? TotalDebt { get; set; }
    public decimal? fiftyTwoWeekHigh { get; set; }
    public decimal? fiftyTwoWeekLow { get; set; }
    public decimal? ChangePercentage { get; set; }
    public decimal? ROE { get; set; }
    public decimal? ROA { get; set; }
    public decimal? PriceToBook { get; set; }
    public decimal? BookValue { get; set; }
    public decimal? DividendRate { get; set; }
    
    // Related data collections
    public ICollection<StockPriceDto> Prices { get; set; } = new List<StockPriceDto>();
    public ICollection<StockNewsDto> News { get; set; } = new List<StockNewsDto>();
    public ICollection<StockDividendDto> Dividends { get; set; } = new List<StockDividendDto>();
}


public class StockPriceDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
   public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public long Volume { get; set; }
}

public class StockNewsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? Source { get; set; }
    public DateTime PublishedDate { get; set; }
    public string? Url { get; set; }
}

public class StockDividendDto
{
    public int Id { get; set; }
    public DateTime ExDividendDate { get; set; }
    public decimal DividendAmount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public DateTime? RecordDate { get; set; }
    public DateTime? DeclaredDate { get; set; }
}
