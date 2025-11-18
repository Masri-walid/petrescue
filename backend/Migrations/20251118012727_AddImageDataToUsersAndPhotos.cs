using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetRescueConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddImageDataToUsersAndPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "profile_image_content_type",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "profile_image_data",
                table: "users",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "profile_image_file_name",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "profile_image_file_size",
                table: "users",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "photo_url",
                table: "animal_photos",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "content_type",
                table: "animal_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_name",
                table: "animal_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "file_size",
                table: "animal_photos",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "photo_data",
                table: "animal_photos",
                type: "bytea",
                nullable: true);

            // Skip creating user_photos table as it already exists
            // migrationBuilder.CreateTable(
            //     name: "user_photos",
            //     columns: table => new
            //     {
            //         id = table.Column<Guid>(type: "uuid", nullable: false),
            //         user_id = table.Column<Guid>(type: "uuid", nullable: false),
            //         photo_url = table.Column<string>(type: "text", nullable: true),
            //         photo_data = table.Column<byte[]>(type: "bytea", nullable: true),
            //         content_type = table.Column<string>(type: "text", nullable: true),
            //         file_name = table.Column<string>(type: "text", nullable: true),
            //         file_size = table.Column<long>(type: "bigint", nullable: true),
            //         caption = table.Column<string>(type: "text", nullable: true),
            //         is_primary = table.Column<bool>(type: "boolean", nullable: false),
            //         created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            //     },
            //     constraints: table =>
            //     {
            //         table.PrimaryKey("PK_user_photos", x => x.id);
            //         table.ForeignKey(
            //             name: "FK_user_photos_users_user_id",
            //             column: x => x.user_id,
            //             principalTable: "users",
            //             principalColumn: "id",
            //             onDelete: ReferentialAction.Cascade);
            //     });

            // migrationBuilder.CreateIndex(
            //     name: "IX_user_photos_user_id",
            //     table: "user_photos",
            //     column: "user_id");

            // Add missing columns to user_photos table (assuming they don't exist)
            migrationBuilder.AddColumn<byte[]>(
                name: "photo_data",
                table: "user_photos",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "content_type",
                table: "user_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_name",
                table: "user_photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "file_size",
                table: "user_photos",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_photos");

            migrationBuilder.DropColumn(
                name: "profile_image_content_type",
                table: "users");

            migrationBuilder.DropColumn(
                name: "profile_image_data",
                table: "users");

            migrationBuilder.DropColumn(
                name: "profile_image_file_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "profile_image_file_size",
                table: "users");

            migrationBuilder.DropColumn(
                name: "content_type",
                table: "animal_photos");

            migrationBuilder.DropColumn(
                name: "file_name",
                table: "animal_photos");

            migrationBuilder.DropColumn(
                name: "file_size",
                table: "animal_photos");

            migrationBuilder.DropColumn(
                name: "photo_data",
                table: "animal_photos");

            migrationBuilder.AlterColumn<string>(
                name: "photo_url",
                table: "animal_photos",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
