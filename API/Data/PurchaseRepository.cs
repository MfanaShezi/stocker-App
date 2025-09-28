using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class PurchaseRepository(DataContext _context) : IPurchaseRepository
{
    public async Task<Purchase?> BuyStockAsync(int userId, string symbol, decimal quantity, DateTime? purchaseDate = null)
    {
      if (quantity <= 0) return null;

        // Verify stock exists
        if (!await StockExistsAsync(symbol)) return null;

        StockPrice? selectedPriceData;

        if (purchaseDate.HasValue)
        {
            // Get historical price for specific date within our 147-day range
            selectedPriceData = await _context.StockPrices
                .Include(sp => sp.Stock)
                .Where(sp => sp.Stock.Symbol == symbol && sp.Date.Date == purchaseDate.Value.Date)
                .FirstOrDefaultAsync();

            if (selectedPriceData == null) return null; // Date not in our data range
        }
        else
        {
            // Get the most recent price (latest day in our 147-day dataset)
            selectedPriceData = await _context.StockPrices
                .Include(sp => sp.Stock)
                .Where(sp => sp.Stock.Symbol == symbol)
                .OrderBy(sp => sp.Date)
                .FirstOrDefaultAsync();

            if (selectedPriceData == null) return null;
        }

        var purchase = new Purchase
        {
            UserId = userId,
            StockSymbol = symbol,
            Quantity = quantity,
            PurchasePrice = selectedPriceData.Close, // Using closing price
            PurchaseDate = selectedPriceData.Date,
            PurchaseValue = quantity * selectedPriceData.Close
        };

        _context.Purchases.Add(purchase);
        await _context.SaveChangesAsync();

        return purchase;
    }

    public async Task<decimal?> GetCurrentStockPriceAsync(string symbol)
    {
         var latestPrice = await _context.StockPrices
            .Include(sp => sp.Stock)
            .Where(sp => sp.Stock.Symbol == symbol)
            .OrderByDescending(sp => sp.Date)
            .Select(sp => sp.Close)
            .FirstOrDefaultAsync();

        return latestPrice == 0 ? null : latestPrice;
    }

    public async Task<decimal?> GetHistoricalStockPriceAsync(string symbol, DateTime date)
    {
         var historicalPrice = await _context.StockPrices
            .Include(sp => sp.Stock)
            .Where(sp => sp.Stock.Symbol == symbol && sp.Date.Date == date.Date)
            .Select(sp => sp.Close)
            .FirstOrDefaultAsync();

        return historicalPrice == 0 ? null : historicalPrice;
    }

    public Task<Purchase?> GetPurchaseByIdAsync(int id)
    {
       return _context.Purchases.Where(p => p.Id == id)
                                .Include(p => p.Stock)
                                .FirstOrDefaultAsync();
    }

    public async Task<List<Purchase>> GetUserPurchasesAsync(int userId)
    {
        return await _context.Purchases
            .Where(p => p.UserId == userId)
            .Include(p => p.Stock)
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync();
    }

    public async Task<List<Purchase>> GetUserPurchasesBySymbolAsync(int userId, string symbol)
    {
        return await _context.Purchases
            .Where(p => p.UserId == userId && p.StockSymbol == symbol)
            .Include(p => p.Stock)
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync();
    }

    public async Task<bool> StockExistsAsync(string symbol)
    {
         return await _context.Stocks.AnyAsync(s => s.Symbol == symbol);
    }
}
