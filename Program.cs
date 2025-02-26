using Microsoft.AspNetCore.Mvc.RazorPages;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddRazorPages();  // Simple RazorPages registration
// or builder.Services.AddControllersWithViews();  // If using MVC

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();  // This line is important for serving files from wwwroot!

app.UseRouting();
app.UseAuthorization();

// Map all Razor Pages
app.MapRazorPages();

// Remove or comment out the weatherforecast code since we don't need it
// var summaries = new[] { ... };
// app.MapGet("/weatherforecast" ...);

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
