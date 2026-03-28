using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260328140000_MarketplaceM8b")]
public partial class MarketplaceM8b : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "ListingPriceVnd",
            schema: "public",
            table: "Movies",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "Purchases",
            schema: "public",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                MovieId = table.Column<Guid>(type: "uuid", nullable: false),
                AmountVnd = table.Column<int>(type: "integer", nullable: false),
                PlatformFeeVnd = table.Column<int>(type: "integer", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                Provider = table.Column<string>(type: "text", nullable: false),
                ExternalId = table.Column<string>(type: "text", nullable: true),
                CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Purchases", x => x.Id);
                table.ForeignKey(
                    name: "FK_Purchases_Movies_MovieId",
                    column: x => x.MovieId,
                    principalSchema: "public",
                    principalTable: "Movies",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Purchases_Users_UserId",
                    column: x => x.UserId,
                    principalSchema: "public",
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Purchases_MovieId",
            schema: "public",
            table: "Purchases",
            column: "MovieId");

        migrationBuilder.CreateIndex(
            name: "IX_Purchases_UserId",
            schema: "public",
            table: "Purchases",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Purchases_UserId_MovieId_Status",
            schema: "public",
            table: "Purchases",
            columns: new[] { "UserId", "MovieId", "Status" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Purchases",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "ListingPriceVnd",
            schema: "public",
            table: "Movies");
    }
}
