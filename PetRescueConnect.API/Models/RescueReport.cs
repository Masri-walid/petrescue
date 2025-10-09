using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace PetRescueConnect.API.Models
{
    public class RescueReport
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(50)]
        public string AnimalType { get; set; } = string.Empty;

        [NotMapped]
        [StringLength(100)]
        public string? Breed { get; set; }

        [NotMapped]
        [StringLength(20)]
        public string? Size { get; set; }

        [NotMapped]
        [StringLength(20)]
        public string? Color { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        // Spatial data using PostGIS POINT column - temporarily disabled until PostGIS is installed
        [NotMapped]
        public Point? Coordinates { get; set; }

        // Temporary simple properties until PostGIS is installed
        [NotMapped]
        public decimal Latitude { get; set; }

        [NotMapped]
        public decimal Longitude { get; set; }

        [Required]
        [StringLength(20)]
        public string UrgencyLevel { get; set; } = "moderate"; // critical, urgent, moderate, low

        [StringLength(50)]
        public string AnimalCondition { get; set; } = "Unknown";

        [NotMapped]
        public bool InjuredOrSick { get; set; } = false;

        [NotMapped]
        [StringLength(500)]
        public string? InjuryDescription { get; set; }

        [Required]
        [StringLength(100)]
        public string ReporterName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ReporterPhone { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(255)]
        public string? ReporterEmail { get; set; }

        public Guid? ReporterId { get; set; }
        public User? Reporter { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "reported"; // reported, assigned, in_progress, rescued, closed, cancelled

        public Guid? AssignedOrganizationId { get; set; }
        public Organization? AssignedOrganization { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<RescuePhoto> Photos { get; set; } = new List<RescuePhoto>();
    }
}
