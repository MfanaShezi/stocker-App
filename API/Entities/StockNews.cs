using System;

namespace API.Entities;

public class StockNews
{
    public int Id { get; set; }
    public int StockId { get; set; }
    public required Stock Stock { get; set; } // Foreign key relationship
    public required string Title { get; set; }
    public required string Link { get; set; }
    public DateTime Published { get; set; }
}