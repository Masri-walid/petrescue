using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("characteristic")]
    public class Characteristic
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("data_type")]
        [MaxLength(50)]
        public string? DataType { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<PhotoCharacteristic> PhotoCharacteristics { get; set; } = new List<PhotoCharacteristic>();
    }
}
