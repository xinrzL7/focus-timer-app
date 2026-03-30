using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Data;
using ProductivityApp.API.Services;

var builder = WebApplication.CreateBuilder(args);

// 加入 DbContext
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseInMemoryDatabase("ProductivityDb"));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=productivity.db"));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 處理跨日
builder.Services.AddScoped<FocusAnalyticsService>();

// 處理CRUD
builder.Services.AddScoped<FocusSessionService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}
app.UseSwagger();
app.UseSwaggerUI();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => "API is running");

app.Run();

