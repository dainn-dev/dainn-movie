using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieSocial.Api.Data;

#nullable disable

namespace MovieSocial.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260328206000_M9WebPushSubscriptions")]
public partial class M9WebPushSubscriptions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PushSubscriptions",
            schema: "public",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Endpoint = table.Column<string>(type: "text", nullable: false),
                P256dh = table.Column<string>(type: "text", nullable: false),
                Auth = table.Column<string>(type: "text", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PushSubscriptions", x => x.Id);
                table.ForeignKey(
                    name: "FK_PushSubscriptions_Users_UserId",
                    column: x => x.UserId,
                    principalSchema: "public",
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PushSubscriptions_Endpoint",
            schema: "public",
            table: "PushSubscriptions",
            column: "Endpoint",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_PushSubscriptions_UserId",
            schema: "public",
            table: "PushSubscriptions",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "PushSubscriptions",
            schema: "public");
    }
}
