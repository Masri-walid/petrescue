using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.Models
{
    public class AnimalPhoto
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid AnimalId { get; set; }
        public Animal Animal { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [StringLength(255)]
        public string? FileName { get; set; }

        [StringLength(100)]
        public string? ContentType { get; set; }

        public long? FileSize { get; set; }

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
