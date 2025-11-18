using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("animal_photos")]
    public class AnimalPhoto
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("animal_id")]
        public Guid AnimalId { get; set; }

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

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AnimalId")]
        public virtual Animal Animal { get; set; } = null!;
    }
}
