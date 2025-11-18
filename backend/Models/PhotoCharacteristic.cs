using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("photo_characteristic")]
    public class PhotoCharacteristic
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("photo_id")]
        public Guid PhotoId { get; set; }

        [Required]
        [Column("characteristic_id")]
        public Guid CharacteristicId { get; set; }

        [Required]
        [Column("value")]
        public string Value { get; set; } = string.Empty;

        [Column("confidence", TypeName = "decimal(5,4)")]
        public decimal? Confidence { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PhotoId")]
        public virtual RescueReportPhoto Photo { get; set; } = null!;

        [ForeignKey("CharacteristicId")]
        public virtual Characteristic Characteristic { get; set; } = null!;
    }
}
