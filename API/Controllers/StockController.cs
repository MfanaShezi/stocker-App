using System;
using API.DTOs;
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
}
