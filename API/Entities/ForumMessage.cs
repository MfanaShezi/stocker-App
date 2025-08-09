using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class ForumMessage
    {
        public int Id { get; set; }
        
        public int ThreadId { get; set; }
        public ForumThread Thread { get; set; } = null!;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
