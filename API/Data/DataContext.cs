using System;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext :IdentityDbContext<User>
{
    public DataContext(DbContextOptions<DataContext> options) : base(options) { }

    public DbSet<WatchList> WatchLists { get; set; }
    public DbSet<Stock> Stocks { get; set; }
    public DbSet<WatchListStock> WatchListStocks { get; set; }
    public DbSet<StockPrice> StockPrices { get; set; }
    public DbSet<StockNews> StockNews { get; set; }
    public DbSet<StockDividend> StockDividends { get; set; } 
    public DbSet<GeneralNews> GeneralNews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //user entity
        modelBuilder.Entity<User>()
                .HasOne(u => u.Watchlist)
                .WithOne(wl => wl.User)
                .HasForeignKey<WatchList>(wl => wl.UserId);

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
            .HasMaxLength(100);

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
    }
}
