using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("rescue_report_photos")]
    public class RescueReportPhoto
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("rescue_report_id")]
        public Guid RescueReportId { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        [Column("photo_data")]
        public byte[]? PhotoData { get; set; }

        [Column("content_type")]
        public string? ContentType { get; set; }

        [Column("file_name")]
        public string? FileName { get; set; }

        [Column("file_size")]
        public long? FileSize { get; set; }

        [Column("caption")]
        public string? Caption { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("RescueReportId")]
        public virtual RescueReport RescueReport { get; set; } = null!;
    }
}
