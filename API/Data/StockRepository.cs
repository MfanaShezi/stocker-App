using System;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class StockRepository(DataContext context,IMapper mapper) : IStockRepository
{
    public async Task<bool> AddToWatchlist(int stockId, int userId)
    {
         var existingWatchlist = await context.WatchListStocks
            .Include(ws => ws.WatchList)
            .FirstOrDefaultAsync(ws => ws.StockId == stockId && ws.WatchList.UserId == userId);

        if (existingWatchlist != null)
        {
           return false; // Already in watchlist
        }

        // Get or create user's watchlist
        var userWatchlist = await context.WatchLists
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (userWatchlist == null)
        {
            // Create new watchlist for user
            var user = await context.Users.FindAsync(userId);
            if (user == null) return false;

            userWatchlist = new WatchList
            {
                UserId = userId,
                User = user
            };
            context.WatchLists.Add(userWatchlist);
            await context.SaveChangesAsync(); 
        }

        // Add stock to watchlist
        var watchlistStock = new WatchListStock
        {
            WatchListId = userWatchlist.Id,
            StockId = stockId
        };

        context.WatchListStocks.Add(watchlistStock);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<StockDto>> GetWatchlistAsync(int userId)
{
    var query = context.WatchListStocks
        .Include(ws => ws.Stock)
            .ThenInclude(s => s.Prices.OrderByDescending(p => p.Date).Take(30))
        .Include(ws => ws.Stock)
            .ThenInclude(s => s.News.OrderByDescending(n => n.Published).Take(5))
        .Include(ws => ws.WatchList)
        .Where(ws => ws.WatchList.UserId == userId)
        .Select(ws => ws.Stock);

    return await query.ProjectTo<StockDto>(mapper.ConfigurationProvider).ToListAsync();
}
    
    public async Task<bool> RemoveFromWatchlistAsync(int stockId, int userId)
    {
        var watchlistStock = await context.WatchListStocks
            .Include(ws => ws.WatchList)
            .FirstOrDefaultAsync(ws => ws.StockId == stockId && ws.WatchList.UserId == userId);

        if (watchlistStock == null)
        {
            return false; // Not in watchlist
        }

        context.WatchListStocks.Remove(watchlistStock);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<StockDto>> GetAllStocksAsync()
    {
        var query = context.Stocks
        .Include(s => s.Prices.OrderByDescending(p => p.Date).Take(30))
        .Include(s => s.News.OrderByDescending(n => n.Published).Take(5))
        .AsQueryable();
        return await query.ProjectTo<StockDto>(mapper.ConfigurationProvider).ToListAsync();
    }

    public async Task<IEnumerable<StockDto>> GetETFs()
    {
        var query = context.Stocks
             .Where(s => s.isETF)
             .AsQueryable();
        
        return await query.ProjectTo<StockDto>(mapper.ConfigurationProvider).ToListAsync();
    }

    public Task<StockDto?> GetStockByIdAsync(int id)
    {
        var query = context.Stocks.Where(s => s.Id == id)
        .Include(s => s.Prices.OrderByDescending(p => p.Date).Take(30)) 
        .Include(s => s.News.OrderByDescending(n => n.Published).Take(5)) 
        .AsQueryable();
        return query.ProjectTo<StockDto>(mapper.ConfigurationProvider).FirstOrDefaultAsync();
    }

    public Task<StockDto?> GetStockBySymbolAsync(string symbol)
    {
        var query = context.Stocks.Where(s => s.Symbol == symbol).AsQueryable();
        return query.ProjectTo<StockDto>(mapper.ConfigurationProvider).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<StockDto>> GetStockOnly()
    {
      var query = context.Stocks
             .Where(s => !s.isETF)
             .AsQueryable();
        
        return await query.ProjectTo<StockDto>(mapper.ConfigurationProvider).ToListAsync();
    }

    public Task<StockDto?> GetStockByIdAsync(string symbol)
    {
       var query = context.Stocks.Where(s => s.Symbol.ToLower() == symbol.Trim().ToLower())
        .Include(s => s.Prices.OrderByDescending(p => p.Date).Take(30)) 
        .Include(s => s.News.OrderByDescending(n => n.Published).Take(5)) 
        .AsQueryable();
        return query.ProjectTo<StockDto>(mapper.ConfigurationProvider).FirstOrDefaultAsync();
    }

    public Task<IEnumerable<StockNewsDto>> GetGeneralNews()
    {
        throw new NotImplementedException();
    }
}
