using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("vaccinations")]
    public class Vaccination
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("animal_id")]
        public Guid AnimalId { get; set; }

        [Required]
        [Column("vaccine_name")]
        [MaxLength(100)]
        public string VaccineName { get; set; } = string.Empty;

        [Required]
        [Column("vaccine_type")]
        [MaxLength(50)]
        public string VaccineType { get; set; } = string.Empty;

        [Required]
        [Column("administered_date")]
        public DateOnly AdministeredDate { get; set; }

        [Column("next_due_date")]
        public DateOnly? NextDueDate { get; set; }

        [Column("veterinarian_id")]
        public Guid? VeterinarianId { get; set; }

        [Column("organization_id")]
        public Guid? OrganizationId { get; set; }

        [Column("batch_number")]
        [MaxLength(50)]
        public string? BatchNumber { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AnimalId")]
        public virtual Animal Animal { get; set; } = null!;

        [ForeignKey("VeterinarianId")]
        public virtual User? Veterinarian { get; set; }

        [ForeignKey("OrganizationId")]
        public virtual Organization? Organization { get; set; }
    }
}
