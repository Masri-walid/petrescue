using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class AdoptionApplicationDto
    {
        public Guid Id { get; set; }
        public Guid AnimalId { get; set; }
        public string AnimalName { get; set; } = string.Empty;
        public Guid ApplicantId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string? HousingType { get; set; }
        public string? OwnRent { get; set; }
        public string? LandlordPermission { get; set; }
        public string? YardType { get; set; }
        public string? Fenced { get; set; }
        public string? PetExperience { get; set; }
        public string? CurrentPets { get; set; }
        public string? Veterinarian { get; set; }
        public string? HoursAlone { get; set; }
        public string? ExerciseTime { get; set; }
        public string? Reference1Name { get; set; }
        public string? Reference1Phone { get; set; }
        public string? Reference2Name { get; set; }
        public string? Reference2Phone { get; set; }
        public string? WhyAdopt { get; set; }
        public string? Expectations { get; set; }
        public bool AgreeTerms { get; set; }
        public bool AgreeVisit { get; set; }
        public bool AgreeContact { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? Score { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAdoptionApplicationRequest
    {
        [Required]
        public Guid AnimalId { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ZipCode { get; set; } = string.Empty;

        [StringLength(50)]
        public string? HousingType { get; set; }

        [StringLength(10)]
        public string? OwnRent { get; set; }

        [StringLength(10)]
        public string? LandlordPermission { get; set; }

        [StringLength(50)]
        public string? YardType { get; set; }

        [StringLength(20)]
        public string? Fenced { get; set; }

        [StringLength(2000)]
        public string? PetExperience { get; set; }

        [StringLength(1000)]
        public string? CurrentPets { get; set; }

        [StringLength(200)]
        public string? Veterinarian { get; set; }

        [StringLength(20)]
        public string? HoursAlone { get; set; }

        [StringLength(20)]
        public string? ExerciseTime { get; set; }

        [StringLength(100)]
        public string? Reference1Name { get; set; }

        [StringLength(20)]
        public string? Reference1Phone { get; set; }

        [StringLength(100)]
        public string? Reference2Name { get; set; }

        [StringLength(20)]
        public string? Reference2Phone { get; set; }

        [StringLength(2000)]
        public string? WhyAdopt { get; set; }

        [StringLength(2000)]
        public string? Expectations { get; set; }

        [Required]
        public bool AgreeTerms { get; set; }

        [Required]
        public bool AgreeVisit { get; set; }

        [Required]
        public bool AgreeContact { get; set; }
    }

    public class UpdateApplicationStatusRequest
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        public int? Score { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }
}
