using System;
using API.Entities;

namespace API.Data;

public interface IPurchaseRepository
{
    Task<Purchase?> BuyStockAsync(int userId, string symbol, decimal quantity, DateTime? purchaseDate = null);
    Task<List<Purchase>> GetUserPurchasesAsync(int userId);
    Task<Purchase?> GetPurchaseByIdAsync(int id);
    Task<decimal?> GetCurrentStockPriceAsync(string symbol);
    Task<decimal?> GetHistoricalStockPriceAsync(string symbol, DateTime date);
    Task<bool> StockExistsAsync(string symbol);
    Task<List<Purchase>> GetUserPurchasesBySymbolAsync(int userId, string symbol);
}
