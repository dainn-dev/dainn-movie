using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260328230000_VideoSourceStreamEndpoints")]
public partial class VideoSourceStreamEndpoints : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "VideoSourceEndpoints",
            schema: "public",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                VideoSourceId = table.Column<Guid>(type: "uuid", nullable: false),
                SortOrder = table.Column<int>(type: "integer", nullable: false),
                R2Key = table.Column<string>(type: "text", nullable: true),
                DirectUrl = table.Column<string>(type: "text", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_VideoSourceEndpoints", x => x.Id);
                table.ForeignKey(
                    name: "FK_VideoSourceEndpoints_VideoSources_VideoSourceId",
                    column: x => x.VideoSourceId,
                    principalSchema: "public",
                    principalTable: "VideoSources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_VideoSourceEndpoints_VideoSourceId_SortOrder",
            schema: "public",
            table: "VideoSourceEndpoints",
            columns: new[] { "VideoSourceId", "SortOrder" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "VideoSourceEndpoints",
            schema: "public");
    }
}
