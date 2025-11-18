using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("animals")]
    public class Animal
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("name")]
        [MaxLength(100)]
        public string? Name { get; set; }

        [Required]
        [Column("species")]
        [MaxLength(50)]
        public string Species { get; set; } = string.Empty;

        [Column("breed")]
        [MaxLength(100)]
        public string? Breed { get; set; }

        [Column("age_category")]
        [MaxLength(20)]
        public string? AgeCategory { get; set; }

        [Column("estimated_age")]
        public int? EstimatedAge { get; set; }

        [Column("gender")]
        [MaxLength(10)]
        public string? Gender { get; set; }

        [Column("size")]
        [MaxLength(20)]
        public string? Size { get; set; }

        [Column("color")]
        [MaxLength(100)]
        public string? Color { get; set; }

        [Column("weight", TypeName = "decimal(5,2)")]
        public decimal? Weight { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("personality_traits")]
        public string[]? PersonalityTraits { get; set; }

        [Column("medical_conditions")]
        public string[]? MedicalConditions { get; set; }

        [Column("special_needs")]
        public string? SpecialNeeds { get; set; }

        [Column("microchip_id")]
        [MaxLength(50)]
        public string? MicrochipId { get; set; }

        [Column("is_spayed_neutered")]
        public bool? IsSpayedNeutered { get; set; }

        [Column("vaccination_status")]
        [MaxLength(50)]
        public string? VaccinationStatus { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "available";

        [Column("organization_id")]
        public Guid? OrganizationId { get; set; }

        [Column("rescue_report_id")]
        public Guid? RescueReportId { get; set; }

        [Column("adoption_fee", TypeName = "decimal(8,2)")]
        public decimal? AdoptionFee { get; set; }

        [Column("is_featured")]
        public bool IsFeatured { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("OrganizationId")]
        public virtual Organization? Organization { get; set; }

        [ForeignKey("RescueReportId")]
        public virtual RescueReport? RescueReport { get; set; }

        public virtual ICollection<AnimalPhoto> AnimalPhotos { get; set; } = new List<AnimalPhoto>();
        public virtual ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public virtual ICollection<Vaccination> Vaccinations { get; set; } = new List<Vaccination>();
    }
}
