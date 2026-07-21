using KeepFocus.Application;
using KeepFocus.Infrastructure;
using KeepFocus.WebAPI.Hubs;
using KeepFocus.WebAPI.Middleware;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});


var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("Frontend");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();
app.MapHub<SessionHub>("/hubs/session");
app.MapFallbackToFile("index.html");

app.Run();