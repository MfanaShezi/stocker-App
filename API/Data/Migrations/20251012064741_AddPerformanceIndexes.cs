using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockPrices_StockId",
                table: "StockPrices");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_UserId",
                table: "Alerts");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_isETF",
                table: "Stocks",
                column: "isETF");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Symbol",
                table: "Stocks",
                column: "Symbol");

            migrationBuilder.CreateIndex(
                name: "IX_StockPrices_StockId_Date",
                table: "StockPrices",
                columns: new[] { "StockId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_ForumThreads_CreatedAt",
                table: "ForumThreads",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_Email",
                table: "AspNetUsers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_UserName",
                table: "AspNetUsers",
                column: "UserName");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_TargetPrice",
                table: "Alerts",
                column: "TargetPrice");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_UserId_StockId",
                table: "Alerts",
                columns: new[] { "UserId", "StockId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Stocks_isETF",
                table: "Stocks");

            migrationBuilder.DropIndex(
                name: "IX_Stocks_Symbol",
                table: "Stocks");

            migrationBuilder.DropIndex(
                name: "IX_StockPrices_StockId_Date",
                table: "StockPrices");

            migrationBuilder.DropIndex(
                name: "IX_ForumThreads_CreatedAt",
                table: "ForumThreads");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_Email",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_UserName",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_TargetPrice",
                table: "Alerts");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_UserId_StockId",
                table: "Alerts");

            migrationBuilder.CreateIndex(
                name: "IX_StockPrices_StockId",
                table: "StockPrices",
                column: "StockId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_UserId",
                table: "Alerts",
                column: "UserId");
        }
    }
}
