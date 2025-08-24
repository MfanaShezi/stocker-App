using System;

namespace API.DTOs
{
    public class ForumThreadDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CreatorUserId { get; set; }
        public string CreatorUsername { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
        public int MessageCount { get; set; }
        public bool IsActive { get; set; }
    }
}
