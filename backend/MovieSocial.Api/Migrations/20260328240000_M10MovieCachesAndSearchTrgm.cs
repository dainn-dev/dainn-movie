using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260328240000_M10MovieCachesAndSearchTrgm")]
public partial class M10MovieCachesAndSearchTrgm : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<double>(
            name: "AvgRatingCached",
            schema: "public",
            table: "Movies",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0);

        migrationBuilder.AddColumn<int>(
            name: "RatingCountCached",
            schema: "public",
            table: "Movies",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "ReviewCountCached",
            schema: "public",
            table: "Movies",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.Sql(
            """
            UPDATE "Movies" m SET
              "RatingCountCached" = (SELECT COUNT(*)::int FROM "Ratings" r WHERE r."MovieId" = m."Id"),
              "AvgRatingCached" = COALESCE((SELECT AVG(r."Score")::float8 FROM "Ratings" r WHERE r."MovieId" = m."Id"), 0),
              "ReviewCountCached" = (SELECT COUNT(*)::int FROM "Reviews" r WHERE r."MovieId" = m."Id");
            """);

        migrationBuilder.CreateIndex(
            name: "IX_Movies_Status_AvgRatingCached",
            schema: "public",
            table: "Movies",
            columns: new[] { "Status", "AvgRatingCached" });

        migrationBuilder.CreateIndex(
            name: "IX_Movies_Status_ReviewCountCached",
            schema: "public",
            table: "Movies",
            columns: new[] { "Status", "ReviewCountCached" });

        migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_trgm;");

        migrationBuilder.Sql(
            """
            CREATE INDEX IF NOT EXISTS "IX_Movies_Title_trgm" ON public."Movies" USING gin (lower("Title") gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS "IX_Movies_Description_trgm" ON public."Movies" USING gin (lower(COALESCE("Description", '')) gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS "IX_Celebrities_Name_trgm" ON public."Celebrities" USING gin (lower("Name") gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS "IX_News_Title_trgm" ON public."News" USING gin (lower("Title") gin_trgm_ops);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            DROP INDEX IF EXISTS public."IX_News_Title_trgm";
            DROP INDEX IF EXISTS public."IX_Celebrities_Name_trgm";
            DROP INDEX IF EXISTS public."IX_Movies_Description_trgm";
            DROP INDEX IF EXISTS public."IX_Movies_Title_trgm";
            """);

        migrationBuilder.DropIndex(
            name: "IX_Movies_Status_ReviewCountCached",
            schema: "public",
            table: "Movies");

        migrationBuilder.DropIndex(
            name: "IX_Movies_Status_AvgRatingCached",
            schema: "public",
            table: "Movies");

        migrationBuilder.DropColumn(
            name: "ReviewCountCached",
            schema: "public",
            table: "Movies");

        migrationBuilder.DropColumn(
            name: "RatingCountCached",
            schema: "public",
            table: "Movies");

        migrationBuilder.DropColumn(
            name: "AvgRatingCached",
            schema: "public",
            table: "Movies");
    }
}
