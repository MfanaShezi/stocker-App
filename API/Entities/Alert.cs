using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Alert
{
     public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int StockId { get; set; }
        
        [Required]
        public decimal TargetPrice { get; set; }
        
        [Required]
        public AlertType AlertType { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? TriggeredAt { get; set; }
        
        // Navigation properties
        public User? User { get; set; }
        public Stock? Stock { get; set; }
}

 public enum AlertType
    {
        PriceAbove,
        PriceBelow
    }