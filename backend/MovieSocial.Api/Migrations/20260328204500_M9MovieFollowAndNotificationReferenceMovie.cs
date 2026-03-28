using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260328204500_M9MovieFollowAndNotificationReferenceMovie")]
public partial class M9MovieFollowAndNotificationReferenceMovie : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "ReferenceMovieId",
            schema: "public",
            table: "Notifications",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "MovieFollows",
            schema: "public",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                MovieId = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_MovieFollows", x => new { x.UserId, x.MovieId });
                table.ForeignKey(
                    name: "FK_MovieFollows_Movies_MovieId",
                    column: x => x.MovieId,
                    principalSchema: "public",
                    principalTable: "Movies",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_MovieFollows_Users_UserId",
                    column: x => x.UserId,
                    principalSchema: "public",
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_MovieFollows_MovieId",
            schema: "public",
            table: "MovieFollows",
            column: "MovieId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "MovieFollows",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "ReferenceMovieId",
            schema: "public",
            table: "Notifications");
    }
}
