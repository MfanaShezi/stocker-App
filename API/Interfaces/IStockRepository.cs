using System;
using API.DTOs;
using API.Entities;

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

    Task<List<NewsDto>> GetGeneralNews();
    Task<IEnumerable<AlertDto>> GetUserAlertsAsync(int userId);
    Task<AlertDto?> GetAlertByIdAsync(int alertId, int userId);
    Task<AlertDto> CreateAlertAsync(CreateAlertDto alertDto, int userId);
    Task<bool> UpdateAlertAsync(int alertId, CreateAlertDto alertDto, int userId);
    Task<bool> DeleteAlertAsync(int alertId, int userId);
    Task<bool> ToggleAlertAsync(int alertId, int userId);
    Task<IEnumerable<Alert>> GetActiveAlertsAsync();


}
