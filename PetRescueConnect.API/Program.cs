using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Middleware;
using PetRescueConnect.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure form options for file uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024; // 50MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configure culture to use invariant culture for decimal parsing
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

// Database - PostgreSQL with NetTopologySuite for spatial data
builder.Services.AddDbContext<PetRescueDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite())
        .EnableSensitiveDataLogging()
        .LogTo(Console.WriteLine, LogLevel.Information);
});

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-secret-key-for-development")),
            RoleClaimType = ClaimTypes.Role
        };
    });

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IDatabaseHealthService, DatabaseHealthService>();
builder.Services.AddScoped<ILocationService, LocationService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000", "https://127.0.0.1:3000", "http://localhost:3001", "https://localhost:3001", "http://127.0.0.1:3001", "https://127.0.0.1:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    // Add a more permissive policy for testing
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Add global exception handling middleware first
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Temporarily disabled for testing

// Add request logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"🌐 {context.Request.Method} {context.Request.Path} from {context.Request.Headers.Origin}");
    await next();
    Console.WriteLine($"📤 Response: {context.Response.StatusCode}");
});

app.UseCors("AllowAll"); // Use permissive CORS for testing
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(); // For serving uploaded images

app.MapControllers();

// Database initialization with error handling
try
{
    Console.WriteLine("🔄 Initializing database...");
    using var conn = new Npgsql.NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"));
    await conn.OpenAsync();
    using var cmd = new Npgsql.NpgsqlCommand("SELECT NOW()", conn);
    var result = cmd.ExecuteScalar();
    Console.WriteLine($"✅ PostgreSQL connection successful! Database time: {result}");

    // Temporarily make coordinates column nullable until PostGIS is installed
    try
    {
        using var fixCmd = new Npgsql.NpgsqlCommand("ALTER TABLE rescue_reports ALTER COLUMN coordinates DROP NOT NULL;", conn);
        await fixCmd.ExecuteNonQueryAsync();
        Console.WriteLine("✅ Made coordinates column nullable");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Could not modify coordinates column: {ex.Message}");
    }



    await conn.CloseAsync();
    Console.WriteLine("✅ Database connection verified - tables should exist!");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Database initialization failed: {ex.Message}");
    Console.WriteLine("API will continue running without database initialization");
}

Console.WriteLine("🚀 Starting API server...");

app.Run();
