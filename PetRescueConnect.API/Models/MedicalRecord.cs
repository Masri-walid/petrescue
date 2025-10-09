using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.Models
{
    public class MedicalRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid AnimalId { get; set; }
        public Animal Animal { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string Type { get; set; } = string.Empty; // Vaccination, Treatment, Surgery, Checkup

        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(200)]
        public string? VeterinarianName { get; set; }

        [StringLength(200)]
        public string? Clinic { get; set; }

        public DateTime Date { get; set; }

        public DateTime? NextDue { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
