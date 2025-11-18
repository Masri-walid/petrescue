using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("adoption_applications")]
    public class AdoptionApplication
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("animal_id")]
        public Guid AnimalId { get; set; }

        [Required]
        [Column("applicant_id")]
        public Guid ApplicantId { get; set; }

        [Required]
        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Required]
        [Column("application_data", TypeName = "jsonb")]
        public string ApplicationData { get; set; } = string.Empty; // JSON data as string

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "submitted";

        [Column("review_notes")]
        public string? ReviewNotes { get; set; }

        [Column("reviewed_by")]
        public Guid? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AnimalId")]
        public virtual Animal Animal { get; set; } = null!;

        [ForeignKey("ApplicantId")]
        public virtual User Applicant { get; set; } = null!;

        [ForeignKey("OrganizationId")]
        public virtual Organization Organization { get; set; } = null!;

        [ForeignKey("ReviewedBy")]
        public virtual User? Reviewer { get; set; }
    }
}
