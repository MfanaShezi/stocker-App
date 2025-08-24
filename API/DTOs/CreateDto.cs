using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class CreateThreadDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
    }
}
