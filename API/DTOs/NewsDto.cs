using System;

namespace API.DTOs;

public class NewsDto
{
     public int Id { get; set; }
    public int StockId { get; set; }
    public required string Title { get; set; }
    public required string Link { get; set; }
    public DateTime Published { get; set; }
}
