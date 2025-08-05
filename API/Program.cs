using API.Data;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.MIddleware;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<DataContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.Configure<AlpacaSettings>(
    builder.Configuration.GetSection("AlpacaSettings"));


// Register the Seed class as a service
builder.Services.AddTransient<Seed>();

var app = builder.Build();

//Middleware configuration
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
.WithOrigins("http://localhost:4200", "https://localhost:4200"));
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();


// Add Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<User>>();

    try
    {
        var seed = services.GetRequiredService<Seed>();
        //await seed.SeedStocksAsync();
       // await seed.FetchAndStoreStockDataParallel();
       // await seed.LoadGeneralNews();
       // await seed.SeedUsersAndWatchlists(userManager);
        Console.WriteLine("Seeding completed successfully.\n");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during seeding: {ex.Message}");
    }
}


app.Run();
