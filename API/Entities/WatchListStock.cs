namespace API.Entities
{
    public class WatchListStock
    {
        public int WatchListId { get; set; } // Foreign Key to WatchList
        public WatchList WatchList { get; set; } = null!;

        public int StockId { get; set; } // Foreign Key to Stock
        public Stock Stock { get; set; } = null!;
    }
}