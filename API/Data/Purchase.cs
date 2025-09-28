using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Purchase
{
    public int Id { get; set; }

    [Required]
    public string StockSymbol { get; set; } = string.Empty;

    [Required]

    public decimal Quantity { get; set; }

    [Required]

    public decimal PurchasePrice { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; }

    [Required]

    public decimal PurchaseValue { get; set; }

    [Required]
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Stock Stock { get; set; } = null!;
}
