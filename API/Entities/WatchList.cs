using System;

namespace API.Entities;

public class WatchList
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public required User User { get; set; }

    public ICollection<WatchListStock> WatchListStocks { get; set; } = new List<WatchListStock>();
}
