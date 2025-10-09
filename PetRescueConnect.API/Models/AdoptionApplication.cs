using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.Models
{
    public class AdoptionApplication
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid AnimalId { get; set; }
        public Animal Animal { get; set; } = null!;

        public Guid ApplicantId { get; set; }
        public User Applicant { get; set; } = null!;

        // Personal Information
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

        // Housing Information
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

        // Experience & Lifestyle
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

        // References
        [StringLength(100)]
        public string? Reference1Name { get; set; }

        [StringLength(20)]
        public string? Reference1Phone { get; set; }

        [StringLength(100)]
        public string? Reference2Name { get; set; }

        [StringLength(20)]
        public string? Reference2Phone { get; set; }

        // Additional Information
        [StringLength(2000)]
        public string? WhyAdopt { get; set; }

        [StringLength(2000)]
        public string? Expectations { get; set; }

        // Agreements
        public bool AgreeTerms { get; set; } = false;
        public bool AgreeVisit { get; set; } = false;
        public bool AgreeContact { get; set; } = false;

        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Withdrawn

        public int? Score { get; set; } // Compatibility score

        [StringLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
