using System;

namespace API.Entities;

public class StockDividend
{
    public int Id { get; set; }
    public int StockId { get; set; }
    public required Stock Stock { get; set; } // Foreign key relationship
    public DateTime Date { get; set; } // Date of the dividend
    public decimal Amount { get; set; } // Dividend amount
}