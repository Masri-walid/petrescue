using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

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
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Phone { get; set; }

        [Required]
        [StringLength(50)]
        public string UserType { get; set; } = "citizen"; // citizen, shelter, veterinarian, admin

        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? State { get; set; }

        [StringLength(10)]
        public string? ZipCode { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? ProfileImageUrl { get; set; }

        public bool IsVerified { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<RescueReport> RescueReports { get; set; } = new List<RescueReport>();
        public ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();

        // Backward compatibility property for Role (maps to UserType)
        [NotMapped]
        public string Role
        {
            get => UserType;
            set => UserType = value;
        }
    }
}
