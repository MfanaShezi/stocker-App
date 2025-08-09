using System;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class StockController(IStockRepository stockRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockDto>>> GetAllStocksAsync()
    {
        var stocks = await stockRepository.GetAllStocksAsync();
        return Ok(stocks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StockDto>> GetStockByIdAsync(int id)
    {
        var stock = await stockRepository.GetStockByIdAsync(id);
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    [HttpGet("etf")]
    public async Task<ActionResult<IEnumerable<StockDto>>> GetAllEtfsAsync()
    {
        var etfs = await stockRepository.GetETFs();
        return Ok(etfs);
    }

    [HttpGet("stock")]
    public async Task<ActionResult<IEnumerable<StockDto>>> GetStockOnly()
    {
        var etfs = await stockRepository.GetStockOnly();
        return Ok(etfs);
    }

    [HttpGet("{symbol}")]
    public async Task<ActionResult<StockDto>> GetStockBySymbolAsync(string symbol)
    {
        var stock = await stockRepository.GetStockBySymbolAsync(symbol);
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    [HttpPost("{stockId}/watchlist")]
    public async Task<ActionResult> AddToWatchlist(int stockId)
    {
        
        // if (!User.Identity?.IsAuthenticated ?? true)
        // {
        //     return Unauthorized("User is not authenticated");
        // }

         var userId = HttpContext.User.GetUserId();
        var result = await stockRepository.AddToWatchlist(stockId, userId);

        if (!result)
        {
            return BadRequest("Stock already in watchlist or user not found");
        }

        return Ok();
    }

    [HttpDelete("{stockId}/watchlist")]
    public async Task<ActionResult> RemoveFromWatchlist(int stockId)
    {
       var userId = User.GetUserId();
        var result = await stockRepository.RemoveFromWatchlistAsync(stockId, userId);

        if (!result)
        {
            return BadRequest("Stock not found in watchlist");
        }

        return Ok();
    }

    [HttpGet("watchlist")]
    public async Task<ActionResult<IEnumerable<StockDto>>> GetWatchlist()
    {
        var userId = User.GetUserId();
        var watchlist = await stockRepository.GetWatchlistAsync(userId);
        return Ok(watchlist);
    }

    [HttpGet("search/{symbol}")]
    public async Task<ActionResult<IEnumerable<StockDto>>> SearchStocks(string symbol)
    {
        var stock = await stockRepository.GetStockBySymbolAsync(symbol);
        return Ok(stock);
    }


}
