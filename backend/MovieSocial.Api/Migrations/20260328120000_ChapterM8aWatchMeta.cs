using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

/// <inheritdoc />
[DbContext(typeof(AppDbContext))]
[Migration("20260328120000_ChapterM8aWatchMeta")]
public partial class ChapterM8aWatchMeta : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "IntroSkipEndSeconds",
            schema: "public",
            table: "Chapters",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "SubtitleR2Key",
            schema: "public",
            table: "Chapters",
            type: "text",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "IntroSkipEndSeconds",
            schema: "public",
            table: "Chapters");

        migrationBuilder.DropColumn(
            name: "SubtitleR2Key",
            schema: "public",
            table: "Chapters");
    }
}
