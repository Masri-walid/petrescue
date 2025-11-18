using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Coordinates { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? LicenseNumber { get; set; }
        public int? Capacity { get; set; }
        public int CurrentAnimalCount { get; set; }
        public double? Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsVerified { get; set; }
        public List<OrganizationHourDto> OrganizationHours { get; set; } = new List<OrganizationHourDto>();
        public List<OrganizationServiceDto> OrganizationServices { get; set; } = new List<OrganizationServiceDto>();
    }

    public class OrganizationHourDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public string? OpenTime { get; set; }
        public string? CloseTime { get; set; }
        public bool IsClosed { get; set; }
    }

    public class OrganizationServiceDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CreateOrganizationDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string OrganizationType { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string State { get; set; } = string.Empty;

        [Required]
        public string ZipCode { get; set; } = string.Empty;

        [Required]
        public string Coordinates { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Website { get; set; }
        public string? LicenseNumber { get; set; }
        public int? Capacity { get; set; }
    }

    public class UpdateOrganizationDto
    {
        public string? Name { get; set; }
        public string? OrganizationType { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Coordinates { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LicenseNumber { get; set; }
        public int? Capacity { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsVerified { get; set; }
        public bool? IsActive { get; set; }
    }
}
