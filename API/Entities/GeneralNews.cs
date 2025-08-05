using System;

namespace API.Entities;

public class GeneralNews
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required string url { get; set; }
    public required DateTime PublishDate { get; set; }
    public required string Source { get; set; }
}
