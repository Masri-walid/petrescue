using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetRescueConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoDataFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "photo_url",
                table: "rescue_report_photos",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "content_type",
                table: "rescue_report_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_name",
                table: "rescue_report_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "file_size",
                table: "rescue_report_photos",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "photo_data",
                table: "rescue_report_photos",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "content_type",
                table: "rescue_report_photos");

            migrationBuilder.DropColumn(
                name: "file_name",
                table: "rescue_report_photos");

            migrationBuilder.DropColumn(
                name: "file_size",
                table: "rescue_report_photos");

            migrationBuilder.DropColumn(
                name: "photo_data",
                table: "rescue_report_photos");

            migrationBuilder.AlterColumn<string>(
                name: "photo_url",
                table: "rescue_report_photos",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
