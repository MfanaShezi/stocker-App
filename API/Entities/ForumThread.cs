using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class ForumThread
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public int CreatedBy { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
    public int MessageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Navigation property
    public ICollection<ForumMessage> Messages { get; set; } = new List<ForumMessage>();
}
