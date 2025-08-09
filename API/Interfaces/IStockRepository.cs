using System;
using API.DTOs;

namespace API.Interfaces;

public interface IStockRepository
{
    Task<IEnumerable<StockDto>> GetAllStocksAsync();
    Task<StockDto?> GetStockByIdAsync(int id);
    Task<StockDto?> GetStockByIdAsync(string symbol);
    Task<StockDto?> GetStockBySymbolAsync(string symbol);

    Task<IEnumerable<StockDto>> GetETFs();
    Task<IEnumerable<StockDto>> GetStockOnly();

    Task<bool> AddToWatchlist(int stockId, int userId);
    Task<bool> RemoveFromWatchlistAsync(int stockId, int userId);
    Task<IEnumerable<StockDto>> GetWatchlistAsync(int userId);

    Task<IEnumerable<StockNewsDto>> GetGeneralNews();


}
