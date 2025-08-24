using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class CreateMessageDto
    {
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}
