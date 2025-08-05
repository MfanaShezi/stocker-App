using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text.Json;
using System.Threading.Tasks;
using Alpaca.Markets;
using API.Entities;
using API.HelperEntities;
using API.Helpers;
using API.Models;
using EFCore.BulkExtensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using YahooFinanceApi;

namespace API.Data
{
    public class Seed
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;
        private readonly IAlpacaTradingClient _alpacaClient;
        private readonly IAlpacaDataClient _alpacaDataClient;

        public Seed(DataContext context, IOptions<AlpacaSettings> alpacaSettings, IConfiguration configuration)
        {
            _context = context;

            _configuration = configuration;

            // Initialize Alpaca clients using settings
            var creds = new SecretKey(alpacaSettings.Value.ApiKey!, alpacaSettings.Value.ApiSecret!);
            _alpacaClient = Alpaca.Markets.Environments.Paper.GetAlpacaTradingClient(creds);
            _alpacaDataClient = Alpaca.Markets.Environments.Paper.GetAlpacaDataClient(creds);
        }

        public async Task SeedStocksAsync()
        {
            // Fetch tradable assets
            var assets = await _alpacaClient.ListAssetsAsync(new AssetsRequest());
            // int counter = 0;

            foreach (var asset in assets)
            {

                Console.WriteLine($"Processing asset: {asset.Name}  Symbol:({asset.Symbol}) Status: {asset.Status} IsTradable: {asset.IsTradable} {asset}");
                if (asset.Status.ToString().ToLower() == "active" && asset.IsTradable)
                {
                    await _context.Stocks.AddAsync(new Stock
                    {
                        Name = asset.Name,
                        Symbol = asset.Symbol,
                        Exchange = asset.Exchange.ToString(),
                        isETF = asset.Name.Contains("ETF") || asset.Name.Contains("Exchange-Traded Fund") ? true : false,
                    
                    });

                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task LoadGeneralNews()
        {

            List<GeneralNews> generalNews = new List<GeneralNews>();
            Console.WriteLine("Fetching general news data...");

            try
            {

                
                    // Read API Key and Base URL from appsettings.json
                    var apiKey = _configuration["MarketauxSettings:ApiKey"];
                    var baseUrl = _configuration["MarketauxSettings:BaseUrl"];

                    // Construct the full API URL
                    var apiUrl = $"{baseUrl}&api_token={apiKey}";

                    using var httpClient = new HttpClient();
                    var response = await httpClient.GetAsync(apiUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        var jsonResponse = await response.Content.ReadAsStringAsync();

                        // Deserialize the JSON response
                        var newsData = JsonSerializer.Deserialize<MarketauxNewsResponse>(jsonResponse, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (newsData != null && newsData.Data != null)
                        {
                            foreach (var article in newsData.Data)
                            {
                                // Add news to the database

                                // if(!generalNews.Any(news => news.Title == article.Title))
                                // {
                                    generalNews.Add(new GeneralNews
                                    {
                                        Title = article.Title!,
                                        Content = article.description!,
                                        url = article.url!,
                                        PublishDate = article.published_at?.ToUniversalTime() ?? DateTime.UtcNow,
                                        Source = article.source!
                                    });
                                // }
                            
                            }
                        }
                        else
                        {
                            Console.WriteLine("No news data found.");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Failed to fetch news data. Status Code: {response.StatusCode}");
                    }
                
                // Add all news to the context
                _context.GeneralNews.AddRange(generalNews);

                // Save changes to the database
                await _context.SaveChangesAsync();
                Console.WriteLine("News data loaded successfully.");

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading news data: {ex.Message}");
            }
        }


        //single stock processing method
        public async Task FetchAndStoreStockData()
        {
            var stocks = await _context.Stocks.Take(100).ToListAsync(); // Fetch stocks from the database


            foreach (var stock in stocks)
            {
                Console.WriteLine($"Fetching data for stock: {stock.Symbol}");

                // Call the Python script
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "py",
                        Arguments = $"Data/python/FetchData.py {stock.Symbol}",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };

                process.Start();

                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();

                Console.WriteLine($"Raw output: {output}");

                process.WaitForExit();

                if (!string.IsNullOrEmpty(error))
                {
                    Console.WriteLine($"Error fetching data for {stock.Symbol}: {error}");
                    continue;
                }

                // Deserialize the JSON response
                var stockData = JsonSerializer.Deserialize<StockData>(output, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (stockData != null)
                {
                    // Update stock details
                    stock.Name = stockData.Name ?? stock.Name;
                    stock.Category = stockData.Info?.AssetClass;
                    stock.Sector = stockData.Info?.Sector;
                    stock.Region = stockData.Info?.Region;
                    stock.AssetClass = stockData.Info?.AssetClass;
                    stock.FundFamily = stockData.Info?.FundFamily;
                    stock.ExpenseRatio = stockData.Info?.ExpenseRatio;
                    stock.PeRatio = stockData.Info?.PeRatio;
                    stock.TotalAssets = stockData.Financials?.CurrentAssets;
                    stock.Description = stockData.Info?.Summary; // Map the summary to the Description field

                    // Add financials
                    if (stockData.Financials != null)
                    {
                        stock.TotalAssets = stockData.Financials.CurrentAssets;
                        stock.TotalDebt = stockData.Financials.TotalDebt;
                        stock.MarketCap = stockData.Financials.MarketCap;
                        stock.ROE = stockData.Financials.ROE; // Map ROE
                        stock.ROA = stockData.Financials.ROA; // Map ROA
                        stock.PriceToBook = stockData.Financials.PriceToBook; // Map PriceToBook
                        stock.BookValue = stockData.Financials.BookValue; // Map BookValue
                        stock.DividendYield = stockData.Financials.DividendYield; // Map DividendYield
                        stock.DividendRate = stockData.Financials.DividendRate; // Map DividendRate
                        stock.hasDividends = stockData.Financials.DividendYield.HasValue || stockData.Financials.DividendYield.HasValue;
                    }

                    // Add historical prices
                    if (stockData.HistoricalPrices != null)
                    {
                        foreach (var price in stockData.HistoricalPrices)
                        {
                            _context.StockPrices.Add(new StockPrice
                            {
                                StockId = stock.Id,
                                Stock = stock, // Set the required Stock property
                                Date = price.Date,
                                Open = price.Open,
                                High = price.High,
                                Low = price.Low,
                                Close = price.Close,
                                Volume = (long)price.Volume!
                            });
                        }
                    }

                    // Add dividends
                    if (stockData.Dividends != null)
                    {
                        foreach (var dividend in stockData.Dividends)
                        {
                            _context.StockDividends.Add(new StockDividend
                            {
                                StockId = stock.Id,
                                Stock = stock, // Set the required Stock property
                                Date = dividend.Date,
                                Amount = dividend.DividendAmount
                            });
                        }
                    }

                    // Add news
                    if (stockData.News != null)
                    {
                        foreach (var news in stockData.News)
                        {
                            if (news.Title != null)
                            {
                                _context.StockNews.Add(new StockNews
                                {
                                    StockId = stock.Id,
                                    Stock = stock, // Set the required Stock property
                                    Title = news.Title,
                                    Link = news.Link!,
                                    Published = news.Published
                                });

                            }

                        }
                    }

                    await _context.SaveChangesAsync();
                }
            }
        }

        //Bulk insert using EF Core 
        public async Task FetchAndStoreStockDataBulk()
        {
            var stocks = await _context.Stocks.Take(100).ToListAsync();

            // Collections to hold all data for bulk operations
            var allStockPrices = new List<StockPrice>();
            var allStockDividends = new List<StockDividend>();
            var allStockNews = new List<StockNews>();
            var updatedStocks = new List<Stock>();

            foreach (var stock in stocks)
            {
                Console.WriteLine($"Fetching data for stock: {stock.Symbol}");

                // Call the Python script (keep this as is since it's external)
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "py",
                        Arguments = $"Data/python/FetchData.py {stock.Symbol}",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };

                process.Start();

                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();

                Console.WriteLine($"Raw output: {output}");
                process.WaitForExit();

                if (!string.IsNullOrEmpty(error))
                {
                    Console.WriteLine($"Error fetching data for {stock.Symbol}: {error}");
                    continue;
                }

                // Deserialize the JSON response
                var stockData = JsonSerializer.Deserialize<StockData>(output, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (stockData != null)
                {
                    // Update stock details (collect for bulk update later)
                    stock.Name = stockData.Name ?? stock.Name;
                    stock.Category = stockData.Info?.AssetClass;
                    stock.Sector = stockData.Info?.Sector;
                    stock.Region = stockData.Info?.Region;
                    stock.AssetClass = stockData.Info?.AssetClass;
                    stock.FundFamily = stockData.Info?.FundFamily;
                    stock.ExpenseRatio = stockData.Info?.ExpenseRatio;
                    stock.PeRatio = stockData.Info?.PeRatio;
                    stock.TotalAssets = stockData.Financials?.CurrentAssets;
                    stock.Description = stockData.Info?.Summary;

                    // Add financials
                    if (stockData.Financials != null)
                    {
                        stock.TotalAssets = stockData.Financials.CurrentAssets;
                        stock.TotalDebt = stockData.Financials.TotalDebt;
                        stock.MarketCap = stockData.Financials.MarketCap;
                        stock.ROE = stockData.Financials.ROE;
                        stock.ROA = stockData.Financials.ROA;
                        stock.PriceToBook = stockData.Financials.PriceToBook;
                        stock.BookValue = stockData.Financials.BookValue;
                        stock.DividendYield = stockData.Financials.DividendYield;
                        stock.DividendRate = stockData.Financials.DividendRate;
                        stock.hasDividends = stockData.Financials.DividendYield.HasValue || stockData.Financials.DividendRate.HasValue;
                    }

                    updatedStocks.Add(stock);

                    // Collect historical prices for bulk insert
                    if (stockData.HistoricalPrices != null)
                    {
                        var stockPrices = stockData.HistoricalPrices.Select(price => new StockPrice
                        {
                            StockId = stock.Id,
                            Stock = stock,
                            Date = price.Date,
                            Open = price.Open,
                            High = price.High,
                            Low = price.Low,
                            Close = price.Close,
                            Volume = (long)price.Volume!
                        }).ToList();

                        allStockPrices.AddRange(stockPrices);
                    }

                    // Collect dividends for bulk insert
                    if (stockData.Dividends != null)
                    {
                        var dividends = stockData.Dividends.Select(dividend => new StockDividend
                        {
                            StockId = stock.Id,
                            Stock = stock,
                            Date = dividend.Date,
                            Amount = dividend.DividendAmount
                        }).ToList();

                        allStockDividends.AddRange(dividends);
                    }

                    // Collect news for bulk insert
                    if (stockData.News != null)
                    {
                        var newsItems = stockData.News
                            .Where(news => news.Title != null)
                            .Select(news => new StockNews
                            {
                                StockId = stock.Id,
                                Stock = stock,
                                Title = news.Title!,
                                Link = news.Link!,
                                Published = news.Published
                            }).ToList();

                        allStockNews.AddRange(newsItems);
                    }
                }
            }

            // Perform all bulk operations at once
            Console.WriteLine("Performing bulk database operations...");

            try
            {
                // Bulk update stocks (if using EF Core Extensions)
                if (updatedStocks.Any())
                {
                    await _context.BulkUpdateAsync(updatedStocks);
                    Console.WriteLine($"Bulk updated {updatedStocks.Count} stocks");
                }

                // Bulk insert stock prices
                if (allStockPrices.Any())
                {
                    await _context.BulkInsertAsync(allStockPrices);
                    Console.WriteLine($"Bulk inserted {allStockPrices.Count} stock prices");
                }

                // Bulk insert dividends
                if (allStockDividends.Any())
                {
                    await _context.BulkInsertAsync(allStockDividends);
                    Console.WriteLine($"Bulk inserted {allStockDividends.Count} dividends");
                }

                // Bulk insert news
                if (allStockNews.Any())
                {
                    await _context.BulkInsertAsync(allStockNews);
                    Console.WriteLine($"Bulk inserted {allStockNews.Count} news items");
                }

                Console.WriteLine("All bulk operations completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during bulk operations: {ex.Message}");
                throw;
            }
        }

        // Alternative method using batching 
        public async Task FetchAndStoreStockDataWithBatching()  
        {
            var stocks = await _context.Stocks.Take(100).ToListAsync();
            const int batchSize = 1000; // Process in batches of 1000 records

            var allStockPrices = new List<StockPrice>();
            var allStockDividends = new List<StockDividend>();
            var allStockNews = new List<StockNews>();

            // ... (same data collection logic as above) ...

            // Process in batches
            Console.WriteLine("Processing data in batches...");

            // Batch insert stock prices
            if (allStockPrices.Any())
            {
                for (int i = 0; i < allStockPrices.Count; i += batchSize)
                {
                    var batch = allStockPrices.Skip(i).Take(batchSize).ToList();
                    _context.StockPrices.AddRange(batch);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Inserted batch of {batch.Count} stock prices");
                }
            }

            // Batch insert dividends
            if (allStockDividends.Any())
            {
                for (int i = 0; i < allStockDividends.Count; i += batchSize)
                {
                    var batch = allStockDividends.Skip(i).Take(batchSize).ToList();
                    _context.StockDividends.AddRange(batch);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Inserted batch of {batch.Count} dividends");
                }
            }

            // Batch insert news
            if (allStockNews.Any())
            {
                for (int i = 0; i < allStockNews.Count; i += batchSize)
                {
                    var batch = allStockNews.Skip(i).Take(batchSize).ToList();
                    _context.StockNews.AddRange(batch);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Inserted batch of {batch.Count} news items");
                }
            }

            // Update stocks in batches
            _context.Stocks.UpdateRange(stocks);
            await _context.SaveChangesAsync();
            Console.WriteLine("Updated all stocks");
        }

        // Method with parallel processing for even better performance
        public async Task FetchAndStoreStockDataParallel()
        {
            var stocks = await _context.Stocks.Take(10).OrderBy(x => x.Id).ToListAsync(); // Fetch the first 100 stocks
            var semaphore = new SemaphoreSlim(6); // Limit concurrent operations to 5
  
            var allStockPrices = new ConcurrentBag<StockPrice>();
            var allStockDividends = new ConcurrentBag<StockDividend>();
            var allStockNews = new ConcurrentBag<StockNews>();
            var updatedStocks = new ConcurrentBag<Stock>();

            var tasks = stocks.Select(async stock =>
            {
                await semaphore.WaitAsync();
                try
                {
                    Console.WriteLine($"Fetching data for stock: {stock.Symbol}");

                    // Execute the Python script to fetch stock data
                    var process = new Process
                    {
                        StartInfo = new ProcessStartInfo
                        {
                            FileName = "py",
                            Arguments = $"Data/python/FetchData.py {stock.Symbol}",
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        }
                    };

                    process.Start();
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();
                    process.WaitForExit();

                    if (!string.IsNullOrEmpty(error))
                    {
                        Console.WriteLine($"Error fetching data for {stock.Symbol}: {error}");
                        return;
                    }

                    // Deserialize the JSON response
                    var stockData = JsonSerializer.Deserialize<StockData>(output, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });


                    if (stockData != null)
                    {
                        // Update stock properties
                        stock.Name = stockData.Name ?? stock.Name;
                        stock.Category = stockData.Info?.AssetClass;
                        stock.Sector = stockData.Info?.Sector;
                        stock.Region = stockData.Info?.Region;
                        stock.AssetClass = stockData.Info?.AssetClass;
                        stock.FundFamily = stockData.Info?.FundFamily;
                        stock.ExpenseRatio = stockData.Info?.ExpenseRatio;
                        stock.PeRatio = stockData.Info?.PeRatio;
                        stock.TotalAssets = stockData.Financials?.CurrentAssets;
                        stock.Description = stockData.Info?.Summary;

                        if (stockData.Financials != null)
                        {
                            stock.TotalAssets = stockData.Financials.CurrentAssets;
                            stock.TotalDebt = stockData.Financials.TotalDebt;
                            stock.SharePrice = stockData.Financials.shareprice;
                            stock.MarketCap = stockData.Financials.MarketCap;
                            stock.ROE = stockData.Financials.ROE; // Map ROE
                            stock.ROA = stockData.Financials.ROA; // Map ROA
                            stock.PriceToBook = stockData.Financials.PriceToBook; // Map PriceToBook
                            stock.BookValue = stockData.Financials.BookValue; // Map BookValue
                            stock.DividendYield = stockData.Financials.DividendYield; // Map DividendYield
                            stock.DividendRate = stockData.Financials.DividendRate; // Map DividendRate
                            stock.fiftyTwoWeekHigh = stockData.Financials.fiftyTwoWeekHigh;
                            stock.fiftyTwoWeekLow = stockData.Financials.fiftyTwoWeekLow;
                            stock.ChangePercentage=( (stockData.Financials.regularMarketChange/stockData.Financials.shareprice)*100);
                            stock.hasDividends = stockData.Financials.DividendYield.HasValue || stockData.Financials.DividendYield.HasValue;
                        }

                        updatedStocks.Add(stock);

                        // Add historical prices
                        if (stockData.HistoricalPrices != null)
                        {
                            foreach (var price in stockData.HistoricalPrices)
                            {
                                allStockPrices.Add(new StockPrice
                                {
                                    StockId = stock.Id,
                                    Stock = stock, // Set the required Stock property
                                    Date = price.Date,
                                    Open = price.Open,
                                    High = price.High,
                                    Low = price.Low,
                                    Close = price.Close,
                                    Volume = (long)price.Volume!
                                });
                            }
                        }

                        // Add dividends
                        if (stockData.Dividends != null)
                        {
                            foreach (var dividend in stockData.Dividends)
                            {
                                allStockDividends.Add(new StockDividend
                                {
                                    StockId = stock.Id,
                                    Stock = stock, // Set the required Stock property
                                    Date = dividend.Date,
                                    Amount = dividend.DividendAmount
                                });
                            }
                        }

                        // Add news
                        if (stockData.News != null)
                        {
                            foreach (var news in stockData.News)
                            {
                                allStockNews.Add(new StockNews
                                {
                                    StockId = stock.Id,
                                    Stock = stock, // Set the required Stock property
                                    Title = news.Title!,
                                    Link = news.Link!,
                                    Published = news.Published,

                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing data for {stock.Symbol}: {ex.Message}");
                }
                finally
                {
                    semaphore.Release();
                }
            });

            await Task.WhenAll(tasks); // Wait for all tasks to complete

            // Perform bulk database operations
            Console.WriteLine("Performing bulk database operations...");

            if (allStockPrices.Any())
            {
                await _context.BulkInsertAsync(allStockPrices.ToList());
            }

            if (allStockDividends.Any())
            {
                await _context.BulkInsertAsync(allStockDividends.ToList());
            }

            if (allStockNews.Any())
            {
                await _context.BulkInsertAsync(allStockNews.ToList());
            }

            if (updatedStocks.Any())
            {
                await _context.BulkUpdateAsync(updatedStocks.ToList());
            }

            Console.WriteLine("All operations completed!");
        }

        public async Task SeedUsersAndWatchlists(UserManager<User> userManager)
        {
            // Create 3 users
            var users = new List<User>
            {
                new User { UserName = "Sam", Email = "Sam@example.com" },
                new User { UserName = "Lisa", Email = "Lisa@example.com" },
                new User { UserName = "Sindy", Email = "Sindy@example.com" }
            };

            foreach (var user in users)
            {
                // Check if the user already exists
              
                    var result = await userManager.CreateAsync(user, "Password123!"); // Default password
                    if (result.Succeeded)
                    {
                        Console.WriteLine($"User {user.Email} created successfully.");
                    }
                    else
                    {
                        Console.WriteLine($"Failed to create user {user.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
             
            }

            // Fetch 15 random stocks from the database
            var stocks = await _context.Stocks.Take(15).ToListAsync();

            if (stocks.Count < 15)
            {
                Console.WriteLine("Not enough stocks in the database to populate watchlists.");
                return;
            }

            // Assign 5 stocks to each user's watchlist
            for (int i = 0; i < users.Count; i++)
            {
                var user = users[i];
                var userEntity = await userManager.FindByIdAsync(user.Id);

                if (userEntity != null)
                {
                    // Create a watchlist for the user
                    var watchList = new WatchList
                    {
                        UserId = userEntity.Id, // Associate with the user's ID
                        User = userEntity
                    };

                    await _context.WatchLists.AddAsync(watchList);
                    await _context.SaveChangesAsync(); // Save to get the WatchListId

                    var watchlistStocks = stocks.Skip(i * 5).Take(5).ToList();

                    foreach (var stock in watchlistStocks)
                    {
                        _context.WatchListStocks.Add(new WatchListStock
                        {
                            WatchListId = watchList.Id, // Associate with the user's watchlist
                            StockId = stock.Id
                        });
                    }

                    Console.WriteLine($"Added 5 stocks to {user.Email}'s watchlist.");
                }
            }

            // Save changes to the database
            await _context.SaveChangesAsync();
            Console.WriteLine("Users and watchlists seeded successfully.");
        }



    }
}
