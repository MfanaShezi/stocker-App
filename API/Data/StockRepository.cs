using System;
using API.DTOs;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class StockRepository(DataContext context,IMapper mapper) : IStockRepository
{
    public async Task<IEnumerable<StockDto>> GetAllStocksAsync()
    {
        var  query=context.Stocks
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
}
