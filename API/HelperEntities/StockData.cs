using System;
using System.Collections.Generic;

namespace API.Models;

public class StockData
{
    public required string Symbol { get; set; }
    public string? Name { get; set; }
    public Info? Info { get; set; }
    public Financials? Financials { get; set; }
    public List<HistoricalPrice>?HistoricalPrices { get; set; }
    public List<Dividend>? Dividends { get; set; }
    public List<News>? News { get; set; }
}

public class Info
{
    public string? AssetClass { get; set; }
    public decimal? ExpenseRatio { get; set; }
    public string? Sector { get; set; }
    public string? Region { get; set; }
    public decimal? PeRatio { get; set; }
    public string? FundFamily { get; set; }
    public string? Exchange { get; set; }
    public string? Summary { get; set; }
}

public class Financials
{
    public decimal? CurrentAssets { get; set; }
    public decimal? CurrentLiabilities { get; set; }
    public decimal? TotalDebt { get; set; }
    public decimal? MarketCap { get; set; }
    public decimal? shareprice { get; set; }
    public decimal? ROE { get; set; }
    public decimal? ROA { get; set; }
    public decimal? PriceToBook { get; set; }
    public decimal? BookValue { get; set; }
    public decimal? DividendYield { get; set; }
    public decimal? DividendRate { get; set; }
    public decimal? fiftyTwoWeekHigh { get; set; }
    public decimal? fiftyTwoWeekLow { get; set; }
    public decimal? regularMarketChange{ get; set; }
}

public class HistoricalPrice
{
    public DateTime Date { get; set; }
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal? Volume { get; set; }
}

public class Dividend
{
    public DateTime Date { get; set; }
    public decimal DividendAmount { get; set; }
}

public class News
{
    public string?Title { get; set; }
    public string? Link { get; set; }
    public DateTime Published { get; set; }
}