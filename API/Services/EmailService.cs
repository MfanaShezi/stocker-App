using System;
using API.Entities;
using API.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace API.Services;

public class EmailService(ILogger<EmailService> _logger, IConfiguration _configuration)
{

    public string GetEmailSetting(string key)
    {
        return _configuration[$"EmailSettings:{key}"]!;
    }

    public async Task SendPriceAlertAsync(string recipientEmail, string userName, string symbol, decimal price, string alertType)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(GetEmailSetting("SmtpUsername"), GetEmailSetting("SenderEmail")));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = $"Price Alert: {symbol} has reached ${price}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #2563eb;'>Price Alert Triggered</h2>
                        <p>Hello {userName},</p>
                        <p>Your {alertType} alert for <strong>{symbol}</strong> has been triggered.</p>
                        <div style='background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;'>
                            <p>Current price: <strong style='font-size: 18px;'>${price}</strong></p>
                            <p>Alert condition: {GetAlertTypeDescription(alertType)}</p>
                            <p>Date & time: {DateTime.UtcNow.ToString("MMMM d, yyyy")} UTC</p>
                        </div>
                        <p><a href='{GetEmailSetting("BaseUrl")}' style='background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Stock Details</a></p>
                        <p style='font-size: 12px; color: #64748b; margin-top: 30px;'>
                            This is an automated message from Stocker. You received this because you set up price alerts.
                            <br>To manage your notification preferences, visit your <a href='{GetEmailSetting("BaseUrl")}'>account settings</a>.
                        </p>
                    </div>
                "
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            _logger.LogInformation($"Attempting to connect to SMTP server: {GetEmailSetting("SmtpServer")}:{GetEmailSetting("SmtpPort")}");
            await client.ConnectAsync(GetEmailSetting("SmtpServer"), int.Parse(GetEmailSetting("SmtpPort")), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(GetEmailSetting("SmtpUsername"), GetEmailSetting("SmtpPassword"));
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation($"Price alert email sent to {recipientEmail} for {symbol}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send price alert email to {recipientEmail}");
            throw;
        }
    }

    private string GetAlertTypeDescription(string alertType)
    {
        return alertType switch
        {
            "PriceAbove" => "Price rose above target",
            "PriceBelow" => "Price fell below target",
            _ => alertType
        };
    }

    public async Task SendPortfolioSummaryAsync(string recipientEmail,string userName, PortfolioSummary summary)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(GetEmailSetting("SmtpUsername"), GetEmailSetting("SenderEmail")));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = $"Your Weekly Portfolio Summary";

            // Calculate performance metrics
            string performanceColor = summary.TotalGainLoss >= 0 ? "#10b981" : "#ef4444";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #2563eb;'>Weekly Portfolio Summary</h2>
                            <p>Hello,{userName}</p>
                            <p>Here's a summary of your investment portfolio for the week ending {DateTime.UtcNow.ToString("MMMM d, yyyy")}</p>
                            
                            <div style='background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; color: #f1f5f9;'>
                                <h3 style='margin-top: 0;'>Portfolio Overview</h3>
                                <p>Total Value: <strong>${summary.TotalValue:N2}</strong></p>
                                <p>Weekly Change: <strong style='color: {performanceColor};'>{(summary.TotalGainLoss >= 0 ? "+" : "")}{summary.TotalGainLoss:N2} ({summary.TotalGainLossPercentage:P2})</strong></p>
                                <p>Total Holdings: <strong>{summary.TotalStocks}</strong></p>
                            </div>

                            <p style='margin-top: 20px;'><a href='{GetEmailSetting("BaseUrl")}' style='background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Full Portfolio</a></p>
                            
                            <p style='font-size: 12px; color: #64748b; margin-top: 30px;'>
                                This is an automated message from Stocker. You received this because you're subscribed to portfolio updates.
                                <br>To manage your notification preferences, visit your <a href='{GetEmailSetting("BaseUrl")}'>account settings</a>.
                            </p>
                        </div>
                    "
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(GetEmailSetting("SmtpServer"), int.Parse(GetEmailSetting("SmtpPort")), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(GetEmailSetting("SmtpUsername"), GetEmailSetting("SmtpPassword"));
            await client.SendAsync(message);
            await client.DisconnectAsync(true);


            _logger.LogInformation($"Portfolio summary email sent to {recipientEmail}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send portfolio summary email to {recipientEmail}");
            throw;
        }
    }
}
