using System;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext(DbContextOptions<DataContext> options) : IdentityDbContext<User, IdentityRole<int>, int>(options)
{
    //public DataContext(DbContextOptions<DataContext> options) : base(options) { }

    public DbSet<WatchList> WatchLists { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<WatchListStock> WatchListStocks { get; set; }
    public DbSet<StockPrice> StockPrices { get; set; }
    public DbSet<StockNews> StockNews { get; set; }
    public DbSet<StockDividend> StockDividends { get; set; }
    public DbSet<GeneralNews> GeneralNews { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<Purchase> Purchases { get; set; }

    // forum entities
    public DbSet<ForumThread> ForumThreads { get; set; }
    public DbSet<ForumMessage> ForumMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //user entity
        modelBuilder.Entity<User>()
                .HasOne(u => u.Watchlist)
                .WithOne(wl => wl.User)
                .HasForeignKey<WatchList>(wl => wl.UserId);

        modelBuilder.Entity<User>()
                .Property(u => u.InvestmentStyle)
                .HasMaxLength(20);

        modelBuilder.Entity<User>()
            .Property(u => u.RiskAppetite)
            .HasMaxLength(20);

        modelBuilder.Entity<User>()
            .Property(u => u.InvestmentGoal)
            .HasMaxLength(50);

        // Configure many-to-many relationship between WatchList and Stock
        modelBuilder.Entity<WatchListStock>()
            .HasKey(wls => new { wls.WatchListId, wls.StockId });

        modelBuilder.Entity<WatchListStock>()
            .HasOne(wls => wls.WatchList)
            .WithMany(wl => wl.WatchListStocks)
            .HasForeignKey(wls => wls.WatchListId);

        modelBuilder.Entity<WatchListStock>()
            .HasOne(wls => wls.Stock)
            .WithMany(s => s.WatchListStocks)
            .HasForeignKey(wls => wls.StockId);

        // Configure Stock entity
        modelBuilder.Entity<Stock>()
            .Property(s => s.Symbol)
            .IsRequired()
            .HasMaxLength(10);

        modelBuilder.Entity<Stock>()
            .Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(255);

        modelBuilder.Entity<Stock>()
        .Property(s => s.Sentiment)
        .HasMaxLength(20);

        modelBuilder.Entity<Stock>()
            .Property(s => s.SentimentScore)
            .HasColumnType("decimal(5,4)");


        modelBuilder.Entity<StockPrice>()
        .HasOne(sp => sp.Stock)
        .WithMany(s => s.Prices)
        .HasForeignKey(sp => sp.StockId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StockPrice>()
       .Property(sp => sp.Date)
       .IsRequired();

        // Configure relationships
        modelBuilder.Entity<Stock>()
            .HasMany(s => s.News)
            .WithOne(n => n.Stock)
            .HasForeignKey(n => n.StockId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Stock>()
            .HasMany(s => s.Dividends)
            .WithOne(d => d.Stock)
            .HasForeignKey(d => d.StockId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure GeneralNews entity
        modelBuilder.Entity<GeneralNews>(entity =>
        {
            entity.HasKey(gn => gn.Id); // Primary key
            entity.Property(gn => gn.Title)
                .IsRequired()
                .HasMaxLength(255); // Title is required and has a max length
            entity.Property(gn => gn.url)
                .IsRequired()
                .HasMaxLength(500); // Link is required and has a max length
            entity.Property(gn => gn.PublishDate)
                .IsRequired(); // Published date is required

        });

        //forum relationships

        modelBuilder.Entity<ForumThread>()
           .HasOne(ft => ft.User)
           .WithMany()
           .HasForeignKey(ft => ft.CreatedBy)
           .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ForumThread>()
            .HasMany(ft => ft.Messages)
            .WithOne(fm => fm.Thread)
            .HasForeignKey(fm => fm.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ForumMessage>()
           .HasOne(fm => fm.User)
           .WithMany()
           .HasForeignKey(fm => fm.UserId)
           .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ForumMessage>()
            .HasOne(fm => fm.Thread)
            .WithMany(ft => ft.Messages)
            .HasForeignKey(fm => fm.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);


        //Alert entity
        modelBuilder.Entity<Alert>()
       .HasOne(a => a.User)
       .WithMany()
       .HasForeignKey(a => a.UserId)
       .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Alert>()
            .HasOne(a => a.Stock)
            .WithMany()
            .HasForeignKey(a => a.StockId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Alert>()
            .Property(a => a.TargetPrice)
            .HasPrecision(18, 2);

        //Purchases
        modelBuilder.Entity<Purchase>(entity =>
       {
           entity.HasOne(p => p.User)
                 .WithMany()
                 .HasForeignKey(p => p.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

           entity.HasOne(p => p.Stock)
                 .WithMany()
                 .HasForeignKey(p => p.StockSymbol)
                 .HasPrincipalKey(s => s.Symbol)
                 .OnDelete(DeleteBehavior.Restrict);
       });

        //precision for decimal fields
        modelBuilder.Entity<StockPrice>()
   .Property(sp => sp.Open)
   .HasPrecision(18, 6);

        modelBuilder.Entity<StockPrice>()
           .Property(sp => sp.High)
           .HasPrecision(18, 6);

        modelBuilder.Entity<StockPrice>()
           .Property(sp => sp.Low)
           .HasPrecision(18, 6);

        modelBuilder.Entity<StockPrice>()
           .Property(sp => sp.Close)
           .HasPrecision(18, 6);



        modelBuilder.Entity<StockPrice>()
           .Property(sp => sp.Volume)
           .HasPrecision(20, 0);

        // Configure relationships
        modelBuilder.Entity<Stock>();
        //Purchase decimal properties
modelBuilder.Entity<Purchase>()
   .Property(p => p.PurchasePrice)
   .HasPrecision(18, 6);

modelBuilder.Entity<Purchase>()
   .Property(p => p.PurchaseValue)
   .HasPrecision(18, 6);

modelBuilder.Entity<Purchase>()
   .Property(p => p.Quantity)
   .HasPrecision(18, 6);

// Stock decimal properties
modelBuilder.Entity<Stock>()
   .Property(s => s.BookValue)
   .HasPrecision(18, 6);

modelBuilder.Entity<Stock>()
   .Property(s => s.ChangePercentage)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.DividendRate)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.DividendYield)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.ExpenseRatio)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.MarketCap)
   .HasPrecision(24, 2);

modelBuilder.Entity<Stock>()
   .Property(s => s.PeRatio)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.PriceToBook)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.ROA)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.ROE)
   .HasPrecision(10, 4);

modelBuilder.Entity<Stock>()
   .Property(s => s.SharePrice)
   .HasPrecision(18, 6);

modelBuilder.Entity<Stock>()
   .Property(s => s.TotalAssets)
   .HasPrecision(24, 2);

modelBuilder.Entity<Stock>()
   .Property(s => s.TotalDebt)
   .HasPrecision(24, 2);

modelBuilder.Entity<Stock>()
   .Property(s => s.fiftyTwoWeekHigh)
   .HasPrecision(18, 6);

modelBuilder.Entity<Stock>()
   .Property(s => s.fiftyTwoWeekLow)
   .HasPrecision(18, 6);

// StockDividend decimal properties
modelBuilder.Entity<StockDividend>()
   .Property(d => d.Amount)
   .HasPrecision(18, 6);
    }

}
