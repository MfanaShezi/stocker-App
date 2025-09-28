using System;

namespace API.DTOs;

public class PurchaseResponseDTO
{
    public int Id { get; set; }
    public required string StockSymbol { get; set; }
    public decimal Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal PurchaseValue { get; set; }
    public required string CompanyName { get; set; }

        // Add current stock data
    public decimal CurrentPrice { get; set; }
    public DateTime CurrentPriceDate { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal ProfitLoss { get; set; }
    public decimal ProfitLossPercentage { get; set; }
}
