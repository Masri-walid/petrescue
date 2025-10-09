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
        public string PhotoUrl { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Caption { get; set; }

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
