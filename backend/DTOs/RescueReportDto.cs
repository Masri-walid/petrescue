using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class RescueReportDto
    {
        public Guid Id { get; set; }
        public Guid? ReporterId { get; set; }
        public string AnimalType { get; set; } = string.Empty;
        public string UrgencyLevel { get; set; } = string.Empty;
        public string AnimalCondition { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string LocationAddress { get; set; } = string.Empty;
        public string? Coordinates { get; set; }
        public string ContactName { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public Guid? AssignedOrganizationId { get; set; }
        public Guid? AssignedVolunteerId { get; set; }
        public DateTime? RescueDate { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public UserDto? Reporter { get; set; }
        public OrganizationDto? AssignedOrganization { get; set; }
        public UserDto? AssignedVolunteer { get; set; }
        public List<RescueReportPhotoDto> RescueReportPhotos { get; set; } = new();
    }

    public class CreateRescueReportDto
    {
        public Guid? ReporterId { get; set; }

        [Required]
        public string AnimalType { get; set; } = string.Empty;

        [Required]
        public string UrgencyLevel { get; set; } = string.Empty;

        [Required]
        public string AnimalCondition { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string LocationAddress { get; set; } = string.Empty;

        public string? Coordinates { get; set; }

        [Required]
        public string ContactName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string ContactPhone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string ContactEmail { get; set; } = string.Empty;
    }

    public class UpdateRescueReportDto
    {
        public string? AnimalType { get; set; }
        public string? UrgencyLevel { get; set; }
        public string? AnimalCondition { get; set; }
        public string? Description { get; set; }
        public string? LocationAddress { get; set; }
        public string? Coordinates { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? Status { get; set; }
        public Guid? AssignedOrganizationId { get; set; }
        public Guid? AssignedVolunteerId { get; set; }
        public DateTime? RescueDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class AssignReportDto
    {
        public Guid OrganizationId { get; set; }
    }

    public class RescueReportPhotoDto
    {
        public Guid Id { get; set; }
        public Guid RescueReportId { get; set; }
        public string? PhotoUrl { get; set; }
        public object? PhotoData { get; set; } // Can be byte[] or string (base64)
        public string? ContentType { get; set; }
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public string? Caption { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
