using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class RescueReportDto
    {
        public Guid Id { get; set; }
        public string AnimalType { get; set; } = string.Empty;
        public string? Breed { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string UrgencyLevel { get; set; } = string.Empty;
        public string AnimalCondition { get; set; } = string.Empty;
        public bool InjuredOrSick { get; set; }
        public string? InjuryDescription { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string ReporterPhone { get; set; } = string.Empty;
        public string? ReporterEmail { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? AssignedOrganizationId { get; set; }
        public string? AssignedOrganizationName { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<RescuePhotoDto> Photos { get; set; } = new();
    }

    public class RescuePhotoDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
    }

    public class CreateRescueReportRequest
    {
        [Required]
        [StringLength(50)]
        public string AnimalType { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Breed { get; set; }

        [StringLength(20)]
        public string? Size { get; set; }

        [StringLength(20)]
        public string? Color { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        [Required]
        [StringLength(20)]
        public string UrgencyLevel { get; set; } = "moderate";

        [StringLength(50)]
        public string AnimalCondition { get; set; } = "Unknown";

        public bool InjuredOrSick { get; set; } = false;

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

        // Photos will be handled directly during form submission
    }

    public class AssignRescueRequest
    {
        [Required]
        public Guid OrganizationId { get; set; }
    }

    public class UpdateRescueStatusRequest
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;
    }
}
