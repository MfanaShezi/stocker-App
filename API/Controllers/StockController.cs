using System;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
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
        var userId = HttpContext.User.GetUserId();
        var watchlist = await stockRepository.GetWatchlistAsync(userId);
        return Ok(watchlist);
    }

    [HttpGet("search/{symbol}")]
    public async Task<ActionResult<IEnumerable<StockDto>>> SearchStocks(string symbol)
    {
        var stock = await stockRepository.GetStockBySymbolAsync(symbol);
        return Ok(stock);
    }

    [HttpGet("news")]
    public async Task<ActionResult<List<NewsDto>>> GetGeneralNews()
    {
        var news = await stockRepository.GetGeneralNews();
        return Ok(news);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlerts()
    {
        var userId = User.GetUserId();
        var alerts = await stockRepository.GetUserAlertsAsync(userId);
        return Ok(alerts);
    }

    [HttpGet("alerts/{alertId:int}")]
    public async Task<ActionResult<AlertDto>> GetAlert(int alertId)
    {
        var userId = User.GetUserId();
        var alert = await stockRepository.GetAlertByIdAsync(alertId, userId);

        if (alert == null)
            return NotFound("Alert not found");

        return Ok(alert);
    }


    [HttpPost("createalert")]
    public async Task<ActionResult<AlertDto>> CreateAlert(CreateAlertDto alertDto)
    {
        var userId = User.GetUserId();
        var alert = await stockRepository.CreateAlertAsync(alertDto, userId);
        return Ok(alert);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAlert(int id, CreateAlertDto alertDto)
    {
        var userId = User.GetUserId();
        var result = await stockRepository.UpdateAlertAsync(id, alertDto, userId);

        if (!result)
            return NotFound("Alert not found");

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAlert(int id)
    {
        var userId = User.GetUserId();
        var result = await stockRepository.DeleteAlertAsync(id, userId);

        if (!result)
            return NotFound("Alert not found");

        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult> ToggleAlert(int id)
    {
        var userId = User.GetUserId();
        var result = await stockRepository.ToggleAlertAsync(id, userId);

        if (!result)
            return NotFound("Alert not found");

        return NoContent();
    }

}
