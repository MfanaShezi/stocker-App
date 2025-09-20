using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSentimentToStockandUserInvestmentStyle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Sentiment",
                table: "Stocks",
                type: "INTEGER",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SentimentScore",
                table: "Stocks",
                type: "decimal(5,4)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InvestmentGoal",
                table: "AspNetUsers",
                type: "INTEGER",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InvestmentStyle",
                table: "AspNetUsers",
                type: "INTEGER",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RiskAppetite",
                table: "AspNetUsers",
                type: "INTEGER",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sentiment",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "SentimentScore",
                table: "Stocks");

            migrationBuilder.DropColumn(
                name: "InvestmentGoal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "InvestmentStyle",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RiskAppetite",
                table: "AspNetUsers");
        }
    }
}
