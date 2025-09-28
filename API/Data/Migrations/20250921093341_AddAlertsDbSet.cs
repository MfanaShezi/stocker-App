using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertsDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alert_AspNetUsers_UserId",
                table: "Alert");

            migrationBuilder.DropForeignKey(
                name: "FK_Alert_Stocks_StockId",
                table: "Alert");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Alert",
                table: "Alert");

            migrationBuilder.RenameTable(
                name: "Alert",
                newName: "Alerts");

            migrationBuilder.RenameIndex(
                name: "IX_Alert_UserId",
                table: "Alerts",
                newName: "IX_Alerts_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Alert_StockId",
                table: "Alerts",
                newName: "IX_Alerts_StockId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Alerts",
                table: "Alerts",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_AspNetUsers_UserId",
                table: "Alerts",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Stocks_StockId",
                table: "Alerts",
                column: "StockId",
                principalTable: "Stocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_AspNetUsers_UserId",
                table: "Alerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Stocks_StockId",
                table: "Alerts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Alerts",
                table: "Alerts");

            migrationBuilder.RenameTable(
                name: "Alerts",
                newName: "Alert");

            migrationBuilder.RenameIndex(
                name: "IX_Alerts_UserId",
                table: "Alert",
                newName: "IX_Alert_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Alerts_StockId",
                table: "Alert",
                newName: "IX_Alert_StockId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Alert",
                table: "Alert",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Alert_AspNetUsers_UserId",
                table: "Alert",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Alert_Stocks_StockId",
                table: "Alert",
                column: "StockId",
                principalTable: "Stocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
