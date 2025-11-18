using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("organizations")]
    public class Organization
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("name")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("organization_type")]
        [MaxLength(50)]
        public string OrganizationType { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Column("city")]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [Column("state")]
        [MaxLength(50)]
        public string State { get; set; } = string.Empty;

        [Required]
        [Column("zip_code")]
        [MaxLength(10)]
        public string ZipCode { get; set; } = string.Empty;

        [Required]
        [Column("coordinates")]
        public string Coordinates { get; set; } = string.Empty; // PostgreSQL point type as string

        [Required]
        [Column("phone")]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("website")]
        [MaxLength(255)]
        public string? Website { get; set; }

        [Column("license_number")]
        [MaxLength(100)]
        public string? LicenseNumber { get; set; }

        [Column("capacity")]
        public int? Capacity { get; set; }

        [Column("current_animal_count")]
        public int CurrentAnimalCount { get; set; } = 0;

        [Column("rating", TypeName = "decimal(2,1)")]
        public decimal Rating { get; set; } = 0.0m;

        [Column("review_count")]
        public int ReviewCount { get; set; } = 0;

        [Column("is_featured")]
        public bool IsFeatured { get; set; } = false;

        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<UserOrganization> UserOrganizations { get; set; } = new List<UserOrganization>();
        public virtual ICollection<Animal> Animals { get; set; } = new List<Animal>();
        public virtual ICollection<RescueReport> AssignedRescueReports { get; set; } = new List<RescueReport>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<OrganizationHour> OrganizationHours { get; set; } = new List<OrganizationHour>();
        public virtual ICollection<OrganizationService> OrganizationServices { get; set; } = new List<OrganizationService>();
        public virtual ICollection<OrganizationSpecialty> OrganizationSpecialties { get; set; } = new List<OrganizationSpecialty>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public virtual ICollection<Vaccination> Vaccinations { get; set; } = new List<Vaccination>();
    }
}
