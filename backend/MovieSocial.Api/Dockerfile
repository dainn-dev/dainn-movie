FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy NuGet config first (overrides global config with local sources)
COPY NuGet.Config ./

# Restore dependencies (context = ./backend, so paths are relative to backend/)
COPY MovieSocial.Api/MovieSocial.Api.csproj MovieSocial.Api/
RUN dotnet restore MovieSocial.Api/MovieSocial.Api.csproj

# Copy everything and publish
COPY . .
RUN dotnet publish MovieSocial.Api/MovieSocial.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# curl needed for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "MovieSocial.Api.dll"]
