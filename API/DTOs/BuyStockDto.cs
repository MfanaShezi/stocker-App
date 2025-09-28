using System;

namespace API.DTOs;

public class BuyStockDto
{
    public required string Symbol { get; set; }
    public decimal Quantity { get; set; }
    public DateTime? PurchaseDate { get; set; } // Optional for specific historical date
}
