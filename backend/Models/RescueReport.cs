using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("rescue_reports")]
    public class RescueReport
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("reporter_id")]
        public Guid? ReporterId { get; set; }

        [Required]
        [Column("animal_type")]
        [MaxLength(50)]
        public string AnimalType { get; set; } = string.Empty;

        [Required]
        [Column("urgency_level")]
        [MaxLength(20)]
        public string UrgencyLevel { get; set; } = string.Empty;

        [Required]
        [Column("animal_condition")]
        public string AnimalCondition { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("location_address")]
        public string LocationAddress { get; set; } = string.Empty;

        [Column("coordinates")]
        public string? Coordinates { get; set; } = "POINT(0 0)"; // PostgreSQL point type as string with default

        [Required]
        [Column("contact_name")]
        [MaxLength(100)]
        public string ContactName { get; set; } = string.Empty;

        [Required]
        [Column("contact_phone")]
        [MaxLength(20)]
        public string ContactPhone { get; set; } = string.Empty;

        [Required]
        [Column("contact_email")]
        [MaxLength(255)]
        public string ContactEmail { get; set; } = string.Empty;

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "reported";

        [Column("assigned_organization_id")]
        public Guid? AssignedOrganizationId { get; set; }

        [Column("assigned_volunteer_id")]
        public Guid? AssignedVolunteerId { get; set; }

        [Column("rescue_date")]
        public DateTime? RescueDate { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("ReporterId")]
        public virtual User? Reporter { get; set; }

        [ForeignKey("AssignedOrganizationId")]
        public virtual Organization? AssignedOrganization { get; set; }

        [ForeignKey("AssignedVolunteerId")]
        public virtual User? AssignedVolunteer { get; set; }

        public virtual ICollection<RescueReportPhoto> RescueReportPhotos { get; set; } = new List<RescueReportPhoto>();
        public virtual ICollection<Animal> Animals { get; set; } = new List<Animal>();
    }
}
