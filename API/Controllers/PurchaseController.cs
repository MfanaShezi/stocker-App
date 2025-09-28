using System;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace API.Controllers;

[Authorize]
public class PurchaseController(IPurchaseRepository _purchaseRepository, DataContext _context) : BaseApiController
{
    [HttpPost("buy")]
    public async Task<ActionResult<PurchaseResponseDTO>> BuyStock(BuyStockDto buyStockDto)
    {
        var userId = HttpContext.User.GetUserId();

        var purchase = await _purchaseRepository.BuyStockAsync(
            userId,
            buyStockDto.Symbol.ToUpper(),
            buyStockDto.Quantity,
            buyStockDto.PurchaseDate
        );

        if (purchase == null)
        {
            return BadRequest("Unable to complete purchase. Check symbol and date.");
        }

        var response = new PurchaseResponseDTO
        {
            Id = purchase.Id,
            StockSymbol = purchase.StockSymbol,
            Quantity = purchase.Quantity,
            PurchasePrice = purchase.PurchasePrice,
            PurchaseDate = purchase.PurchaseDate,
            PurchaseValue = purchase.PurchaseValue,
            CompanyName = purchase.Stock?.Name ?? "Unknown"
        };

        return Ok(response);
    }

    [HttpGet("portfolio")]
    public async Task<ActionResult<UserPortFolioDto>> GetUserPortfolio()
    {
        var userId = HttpContext.User.GetUserId();
        var purchases = await _purchaseRepository.GetUserPurchasesAsync(userId);

        var portfolioDto = new UserPortFolioDto
        {
            Purchases = new List<PurchaseResponseDTO>(),
            TotalInvested = purchases.Sum(p => p.PurchaseValue),
            TotalPositions = purchases.Count
        };

        // Calculate current values for each purchase
        foreach (var purchase in purchases)
        {
            var latestPriceData = await _context.StockPrices
                .Where(sp => sp.Stock.Symbol == purchase.StockSymbol)
                .OrderByDescending(sp => sp.Date)
                .Select(sp => new { sp.Close, sp.Date })
                .FirstOrDefaultAsync();

            var currentPrice = latestPriceData?.Close ?? 0;
            var currentPriceDate = latestPriceData?.Date ?? null;
            var currentValue = purchase.Quantity * currentPrice;
            var profitLoss = currentValue - purchase.PurchaseValue;
            var profitLossPercentage = purchase.PurchaseValue > 0 ? ((currentValue - purchase.PurchaseValue) / purchase.PurchaseValue) * 100 : 0;



            portfolioDto.Purchases.Add(new PurchaseResponseDTO
            {
                Id = purchase.Id,
                StockSymbol = purchase.StockSymbol,
                Quantity = purchase.Quantity,
                PurchasePrice = purchase.PurchasePrice,
                PurchaseDate = purchase.PurchaseDate,
                PurchaseValue = purchase.PurchaseValue,
                CompanyName = purchase.Stock?.Name ?? "Unknown",
                CurrentPrice = currentPrice,
                CurrentPriceDate = currentPriceDate ?? DateTime.MinValue,
                CurrentValue = currentValue,
                ProfitLoss = profitLoss,
                ProfitLossPercentage = profitLossPercentage
            });
        }

        return Ok(portfolioDto);
    }

    [HttpGet("stock/{symbol}")]
    public async Task<ActionResult<List<PurchaseResponseDTO>>> GetPurchasesBySymbol(string symbol)
    {
        var userId = HttpContext.User.GetUserId();

        var purchases = await _purchaseRepository.GetUserPurchasesBySymbolAsync(userId, symbol.ToUpper());

        var response = purchases.Select(p => new PurchaseResponseDTO
        {
            Id = p.Id,
            StockSymbol = p.StockSymbol,
            Quantity = p.Quantity,
            PurchasePrice = p.PurchasePrice,
            PurchaseDate = p.PurchaseDate,
            PurchaseValue = p.PurchaseValue,
            CompanyName = p.Stock?.Name ?? "Unknown"
        }).ToList();

        return Ok(response);
    }

//     [HttpDelete("{id}")]
// public async Task<IActionResult> SellStock(int id)
// {
//     try
//     {
//         // Find the purchase
//         var purchase = await _context.Purchases.FindAsync(id);
        
//         if (purchase == null)
//         {
//             return NotFound(new { message = "Purchase not found" });
//         }

//         // Remove the purchase from database
//         _context.Purchases.Remove(purchase);
//         await _context.SaveChangesAsync();

//         return Ok();
//     }
//     catch (Exception ex)
//     {
//         return BadRequest(new { message = "Error selling stock", error = ex.Message });
//     }
// }

[HttpDelete("all/{symbol}")]
public async Task<IActionResult> SellAllStock(string symbol)
{
    try
    {
        var userId = User.GetUserId();
        
        var purchases = await _context.Purchases
            .Where(p => p.UserId == userId && p.StockSymbol.ToUpper() == symbol.ToUpper())
            .ToListAsync();

        if (!purchases.Any())
        {
            return NotFound(new { message = $"No purchases found for {symbol}" });
        }

        var totalShares = purchases.Sum(p => p.Quantity);
        var totalValue = purchases.Sum(p => p.PurchaseValue);

        _context.Purchases.RemoveRange(purchases);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Successfully sold all {totalShares} shares of {symbol}",
            soldShares = totalShares,
            originalInvestment = totalValue,
            stockSymbol = symbol,
            purchasesSold = purchases.Count
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = "Error selling all shares", error = ex.Message });
    }
}

}
