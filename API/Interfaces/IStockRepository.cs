using System;
using API.DTOs;

namespace API.Interfaces;

public interface IStockRepository
{
    Task<IEnumerable<StockDto>> GetAllStocksAsync();
    Task<StockDto?> GetStockByIdAsync(int id);
    Task<StockDto?>GetStockBySymbolAsync(string symbol);

    Task<IEnumerable<StockDto>> GetETFs();
    Task<IEnumerable<StockDto>> GetStockOnly();

}
