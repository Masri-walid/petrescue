using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("medical_records")]
    public class MedicalRecord
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("animal_id")]
        public Guid AnimalId { get; set; }

        [Column("veterinarian_id")]
        public Guid? VeterinarianId { get; set; }

        [Column("organization_id")]
        public Guid? OrganizationId { get; set; }

        [Required]
        [Column("record_type")]
        [MaxLength(50)]
        public string RecordType { get; set; } = string.Empty;

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("medications")]
        public string[]? Medications { get; set; }

        [Column("next_appointment_date")]
        public DateOnly? NextAppointmentDate { get; set; }

        [Column("cost", TypeName = "decimal(8,2)")]
        public decimal? Cost { get; set; }

        [Required]
        [Column("record_date")]
        public DateOnly RecordDate { get; set; }

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
