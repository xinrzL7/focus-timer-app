using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Data;
using ProductivityApp.API.Services;

var builder = WebApplication.CreateBuilder(args);

var dbPath = DbPathHelper.GetDbPath();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// 處理跨日
builder.Services.AddScoped<FocusAnalyticsService>();
// 處理CRUD
builder.Services.AddScoped<FocusSessionService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

//app.UseHttpsRedirection();
app.UseAuthorization();

app.MapGet("/", () => "API is running");
app.MapControllers();

app.Run();

