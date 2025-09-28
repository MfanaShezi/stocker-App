using System;

namespace API.DTOs;

public class AlertDto
{
    public int Id { get; set; }
        public int StockId { get; set; }
        public string? StockSymbol { get; set; }
        public string? StockName { get; set; }
        public decimal TargetPrice { get; set; }
        public string? AlertType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? TriggeredAt { get; set; }
}
