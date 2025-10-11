using System;
using API.Data;
using API.Entities;
using API.Interfaces;
using API.Services;
using Microsoft.EntityFrameworkCore;

namespace API.HelperEntities;

public class EmailBackgroundService : BackgroundService
{

    private readonly ILogger<EmailBackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public EmailBackgroundService( ILogger<EmailBackgroundService> logger,IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
       
    }

    
    
   protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Create a scope when needed, dispose it when done
                using (var scope = _scopeFactory.CreateScope())
                {
                    // Get all required services within the same scope
                    var stockRepository = scope.ServiceProvider.GetRequiredService<IStockRepository>();
                    var context = scope.ServiceProvider.GetRequiredService<DataContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

                    // Process alerts or periodic emails
                    await CheckPriceAlerts(stockRepository, context, emailService);
                    if (DateTime.Now.DayOfWeek == DayOfWeek.Friday && DateTime.Now.Hour == 10)
                     {
                        _logger.LogInformation("It's Friday 8AM - time to send weekly summaries");
                        await SendWeeklyPortfolioSummaries(stockRepository, context, emailService);
                    }
                }
                
                // Wait for next check
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in EmailBackgroundService");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }

    private async Task CheckPriceAlerts(IStockRepository _stockRepository,DataContext _context, EmailService _emailService)
    {
        _logger.LogInformation("Checking price alerts at {time}", DateTimeOffset.Now);


        // Get all active price alerts
        var alerts = await _context.Alerts.Where(a => a.IsActive).ToListAsync();
        if (alerts.Any())
        {

            foreach (var alert in alerts)
            {
                   var currentStock = await _stockRepository.GetStockByIdAsync(alert.StockId);
                var currentPrice = currentStock?.SharePrice;

                // Check if price crossed the threshold
                bool triggered = false;

                if (alert.AlertType == 0 && currentPrice >= alert.TargetPrice)
                {
                    triggered = true;
                }
                else if ((int)alert.AlertType == 1 && currentPrice <= alert.TargetPrice)
                {
                    triggered = true;
                }

                if (triggered)
                {
                    // Send alert email
                    if (alert.UserId != 0 )
                    {
                        var user = await _context.Users.FindAsync(alert.UserId);
                        var stock= await _context.Stocks.FindAsync(alert.StockId);
                        alert.Stock = stock;
                        alert.User = user;

                        // if (alert.User?.Email != null && alert.Stock?.Symbol != null && alert.User?.UserName != null && alert.Stock != null)
                        // {
                            await _emailService.SendPriceAlertAsync(
                                alert.User?.Email!,
                                alert.User?.UserName!,
                                alert.Stock?.Symbol!,
                                currentPrice ?? 0,
                                alert.AlertType == 0 ? "above" : "below"
                            );
                        //}
                    }

                    // Mark alert as processed if it's a one-time alert
                        alert.IsActive = false;
                    alert.TriggeredAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
        }
    }

    private async Task SendWeeklyPortfolioSummaries(IStockRepository _stockRepository,DataContext _context, EmailService _emailService)
    {
        _logger.LogInformation("Sending weekly portfolio summaries at {time}", DateTimeOffset.Now);

        // Get all users with portfolio summary enabled
        var users = await _context.Users
            .ToListAsync();

        foreach (var user in users)
        {
            try
            {
                // Check if user has any purchases
                var purchases = await _context.Purchases
                    .Include(p => p.Stock)
                    .Where(p => p.UserId == user.Id)
                    .ToListAsync();

                if (!purchases.Any())
                {
                    _logger.LogInformation("No purchases found for user {Email}, skipping", user.Email);
                    continue;
                }

                // Group purchases by stock symbol
                var stockGroups = purchases.GroupBy(p => p.StockSymbol);

                decimal totalValue = 0;
                decimal totalCost = 0;
                int stockCount = 0;

                // Calculate portfolio metrics
                foreach (var stockGroup in stockGroups)
                {
                    var symbol = stockGroup.Key;

                    // Calculate total shares and weighted average cost
                    decimal totalShares = stockGroup.Sum(p => p.Quantity);
                    decimal totalInvested = stockGroup.Sum(p => p.PurchaseValue);

                    // Skip stocks with zero shares (completely sold)
                    if (totalShares <= 0)
                        continue;

                    // Get current price (using your stock service)
                   var currentStock = await _stockRepository.GetStockByIdAsync(stockGroup.First().Stock.Id);
                   var currentPrice = currentStock?.SharePrice;

                    // Calculate current value
                    decimal currentValue = (decimal)(currentPrice * totalShares)!;

                    totalValue += currentValue;
                    totalCost += totalInvested;
                    stockCount++;
                }

                // Calculate overall portfolio metrics
                decimal totalGainLoss = totalValue - totalCost;
                decimal totalGainLossPercentage = totalCost > 0 ? totalGainLoss / totalCost : 0;

                // Create the summary object
                var summary = new PortfolioSummary
                {
                    TotalValue = totalValue,
                    TotalGainLoss = totalGainLoss,
                    TotalGainLossPercentage = totalGainLossPercentage,
                    TotalStocks = stockCount
                };

                // Send the email
                await _emailService.SendPortfolioSummaryAsync(user.Email!,user.UserName!, summary);
                _logger.LogInformation("Sent weekly summary to {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send portfolio summary to {Email}", user.Email);
                // Continue with next user
            }
        }
    }

    private DateTime GetNextWeekday(DateTime start, DayOfWeek day)
    {
        int daysToAdd = ((int)day - (int)start.DayOfWeek + 7) % 7;
        if (daysToAdd == 0) // Today is the target day, so we want next week
            daysToAdd = 7;

        return start.Date.AddDays(daysToAdd);
    }


}
