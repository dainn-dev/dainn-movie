using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MovieSocial.Api;
using MovieSocial.Api.Data;
using MovieSocial.Api.Endpoints;
using MovieSocial.Api.Hubs;
using MovieSocial.Api.Services;
using Serilog;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Serilog
    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .WriteTo.Console()
        .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day));

    // PostgreSQL + EF Core
    var connectionString = builder.Configuration.GetConnectionString("Postgres")
        ?? throw new InvalidOperationException("Connection string 'Postgres' not found.");
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseNpgsql(connectionString));

    // Redis
    var redisConnection = builder.Configuration.GetConnectionString("Redis")
        ?? "localhost:6379";
    builder.Services.AddStackExchangeRedisCache(opt =>
        opt.Configuration = redisConnection);
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
        ConnectionMultiplexer.Connect(redisConnection));

    builder.Services.AddHangfire(cfg => cfg
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(o => o.UseNpgsqlConnection(connectionString)));

    builder.Services.AddHangfireServer();

    // JWT Authentication
    var jwtSecret = builder.Configuration["Jwt:Secret"]
        ?? throw new InvalidOperationException("Jwt:Secret not configured.");
    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MovieSocial";
    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MovieSocial";

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };
            opt.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.HttpContext.Request.Path.StartsWithSegments("/hubs/chat"))
                    {
                        var token = context.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(token)) context.Token = token;
                    }
                    return Task.CompletedTask;
                },
            };
        });

    builder.Services.AddAuthorization(options =>
        options.AddPolicy("AdminOnly", p => p.RequireClaim("role", "admin")));

    builder.Services.AddSignalR();
    builder.Services.AddResponseCompression(o => o.EnableForHttps = true);

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(static ctx =>
        {
            var key =
                ctx.User.Identity?.IsAuthenticated == true
                    ? (ctx.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                       ?? ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? ctx.Connection.Id)
                    : ctx.Connection.RemoteIpAddress?.ToString() ?? "anon";
            return RateLimitPartition.GetFixedWindowLimiter(key,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 400,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0,
                });
        });
    });

    // FluentValidation
    builder.Services.AddValidatorsFromAssemblyContaining<Program>();

    // Swagger / OpenAPI
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(opt =>
    {
        opt.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "MovieSocial API",
            Version = "v1",
            Description = "Movie social platform API",
        });

        opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
        });

        opt.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString, name: "postgres", tags: ["db"])
        .AddRedis(redisConnection, name: "redis", tags: ["cache"]);

    // CORS
    builder.Services.AddCors(opt =>
        opt.AddDefaultPolicy(p =>
            p.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"])
             .AllowAnyMethod()
             .AllowAnyHeader()
             .AllowCredentials()));

    // Auth + User Services
    builder.Services.AddScoped<TokenService>();
    builder.Services.AddScoped<AuthService>();
    builder.Services.AddScoped<UserService>();
    builder.Services.AddScoped<PasswordResetService>();
    builder.Services.AddScoped<MovieService>();
    builder.Services.AddScoped<CelebrityService>();
    builder.Services.AddScoped<NewsService>();
    builder.Services.AddScoped<SearchService>();
    builder.Services.AddScoped<StreamUrlService>();
    builder.Services.AddScoped<ChapterService>();
    builder.Services.AddScoped<ReviewRatingService>();
    builder.Services.AddScoped<UploadRateLimitService>();
    builder.Services.AddScoped<VideoUploadService>();
    builder.Services.AddScoped<TranscodeProcessor>();
    builder.Services.AddScoped<SocialService>();
    builder.Services.AddScoped<AdminService>();

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    app.UseResponseCompression();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(opt => opt.SwaggerEndpoint("/swagger/v1/swagger.json", "MovieSocial API v1"));
        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = [new HangfireAllowAllDashboardAuthorizationFilter()],
            DashboardTitle = "MovieSocial Jobs",
        });
    }

    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();

    // Health check endpoint
    app.MapHealthChecks("/health", new HealthCheckOptions { AllowCachingResponses = false });

    // Auth endpoints
    app.MapAuthEndpoints();
    app.MapUserEndpoints();
    app.MapMovieEndpoints();
    app.MapCelebrityEndpoints();
    app.MapNewsEndpoints();
    app.MapSearchEndpoints();
    app.MapChapterEndpoints();
    app.MapReviewEndpoints();
    app.MapVideoEndpoints();
    app.MapSocialEndpoints();
    app.MapAdminEndpoints();
    app.MapHub<ChatHub>("/hubs/chat").RequireAuthorization();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
