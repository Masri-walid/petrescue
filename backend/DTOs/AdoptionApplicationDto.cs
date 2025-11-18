using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class AdoptionApplicationDto
    {
        public Guid Id { get; set; }
        public Guid AnimalId { get; set; }
        public Guid ApplicantId { get; set; }
        public Guid OrganizationId { get; set; }
        public string ApplicationData { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ReviewNotes { get; set; }
        public Guid? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public AnimalDto? Animal { get; set; }
        public UserDto? Applicant { get; set; }
        public OrganizationDto? Organization { get; set; }
        public UserDto? Reviewer { get; set; }
    }

    public class CreateAdoptionApplicationDto
    {
        [Required]
        public Guid AnimalId { get; set; }

        [Required]
        public Guid ApplicantId { get; set; }

        [Required]
        public Guid OrganizationId { get; set; }

        [Required]
        public object ApplicationData { get; set; } = new();
    }

    public class UpdateAdoptionApplicationDto
    {
        public object? ApplicationData { get; set; }
        public string? Status { get; set; }
        public string? ReviewNotes { get; set; }
        public Guid? ReviewedBy { get; set; }
    }

    public class ReviewAdoptionApplicationDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public string? ReviewNotes { get; set; }

        [Required]
        public Guid ReviewedBy { get; set; }
    }
}
