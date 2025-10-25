using API.Data;
using API.Entities;
using API.Extensions;
using API.HelperEntities;
using API.Helpers;
using API.Interfaces;
using API.MIddleware;
using API.Services;
using API.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
//sql lite config
// builder.Services.AddDbContext<DataContext>(opt =>
// {
//     opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
// });

//sql server config
builder.Services.AddDbContext<DataContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IForumRepository, ForumRepository>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddSignalR();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddSingleton<SeedingState>();
builder.Services.Configure<AlpacaSettings>(builder.Configuration.GetSection("AlpacaSettings")); ;
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));


// Register the Seed class as a service
builder.Services.AddTransient<Seed>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddHostedService<EmailBackgroundService>();

var app = builder.Build();

//Middleware configuration
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
.WithOrigins("http://localhost:4200", "https://localhost:4200","http://localhost:80"));
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<ForumHub>("/hubs/forumHub");

// Add Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<User>>();
    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
    try
    {
        Console.WriteLine("Applying database migrations programmatically...");
        db.Database.Migrate();
        var seed = services.GetRequiredService<Seed>();
        Console.WriteLine("starting database seeding");
        //await seed.SeedUsers(userManager);
        //await seed.LoadGeneralNews();
        //await seed.SeedStocksAsync();
       // await seed.FetchAndStoreStockDataParallel();
       
        //await seed.seedWatchlist(userManager); // seedWatchlist
      //  await seed.SeedUsersAndWatchlists(userManager);*no longer exists
       // await seed.SeedSentimentParallel();
       // await seed.SeedForumDataAsync();
       // await seed.CreateAlertsForUsers();
       // await seed.SeedPurchases();
        Console.WriteLine("Seeding completed successfully.\n");
        var seedingState = services.GetRequiredService<SeedingState>();
        seedingState.SetSeedingComplete();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during seeding: {ex.Message}");
    }
}


app.Run();
