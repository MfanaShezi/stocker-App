using System;

namespace API.DTOs;

public class NewsDto
{
     public int Id { get; set; }
    public int StockId { get; set; }

    public required string Content { get; set; }
    public required string Source { get; set; }
    public required string Title { get; set; }
    public required string url { get; set; }
    
    public DateTime PublishDate { get; set; }
}
