using System;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class StockRepository(DataContext context, IMapper mapper) : IStockRepository
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
        var query = context.Stocks.Take(20)
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

    public Task<List<NewsDto>> GetGeneralNews()
    {
        var query = context.GeneralNews
         .OrderByDescending(n => n.PublishDate)
         .Take(20)
         .AsQueryable();

        return query.ProjectTo<NewsDto>(mapper.ConfigurationProvider).ToListAsync();

    }

    public async Task<IEnumerable<AlertDto>> GetUserAlertsAsync(int userId)
    {
        return await context.Alerts
            .Where(a => a.UserId == userId)
            .Include(a => a.Stock)
            .Select(a => new AlertDto
            {
                Id = a.Id,
                StockId = a.StockId,
                StockSymbol = a.Stock!.Symbol,
                StockName = a.Stock.Name,
                TargetPrice = a.TargetPrice,
                AlertType = a.AlertType.ToString(),
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                TriggeredAt = a.TriggeredAt
            })
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<AlertDto?> GetAlertByIdAsync(int alertId, int userId)
    {
        return await context.Alerts
            .Where(a => a.Id == alertId && a.UserId == userId)
            .Include(a => a.Stock)
            .Select(a => new AlertDto
            {
                Id = a.Id,
                StockId = a.StockId,
                StockSymbol = a.Stock!.Symbol,
                StockName = a.Stock.Name,
                TargetPrice = a.TargetPrice,
                AlertType = a.AlertType.ToString(),
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                TriggeredAt = a.TriggeredAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AlertDto> CreateAlertAsync(CreateAlertDto alertDto, int userId)
    {
        var alert = new Alert
        {
            UserId = userId,
            StockId = alertDto.StockId,
            TargetPrice = alertDto.TargetPrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            AlertType = Enum.Parse<AlertType>(alertDto.AlertType!)
        };

        context.Alerts.Add(alert);
        await context.SaveChangesAsync();

        return await GetAlertByIdAsync(alert.Id, userId)!;
    }

    public async Task<bool> UpdateAlertAsync(int alertId, CreateAlertDto alertDto, int userId)
    {
        var alert = await context.Alerts
            .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);

        if (alert == null) return false;

        alert.TargetPrice = alertDto.TargetPrice;
        alert.AlertType = Enum.Parse<AlertType>(alertDto.AlertType!);

    await context.SaveChangesAsync();
    return true;
    }

    public async Task<bool> DeleteAlertAsync(int alertId, int userId)
    {
        var alert = await context.Alerts
            .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);

        if (alert == null) return false;

        context.Alerts.Remove(alert);
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ToggleAlertAsync(int alertId, int userId)
    {
        var alert = await context.Alerts
            .FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId);

        if (alert == null) return false;

        alert.IsActive = !alert.IsActive;
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<Alert>> GetActiveAlertsAsync()
    {
        return await context.Alerts
            .Where(a => a.IsActive)
            .Include(a => a.Stock)
            .Include(a => a.User)
            .ToListAsync();
    }



}
