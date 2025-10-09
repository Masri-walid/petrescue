using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    public class Animal
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Species { get; set; } = string.Empty; // dog, cat, rabbit, bird, other

        [StringLength(100)]
        public string? Breed { get; set; }

        [StringLength(20)]
        public string? AgeCategory { get; set; } // puppy, kitten, young, adult, senior

        public int? EstimatedAge { get; set; } // in months

        [StringLength(10)]
        public string? Gender { get; set; } // male, female, unknown

        [StringLength(20)]
        public string? Size { get; set; } // small, medium, large, extra_large

        [StringLength(100)]
        public string? Color { get; set; }

        public decimal? Weight { get; set; } // in kg

        [StringLength(1000)]
        public string? Description { get; set; }

        public bool Vaccinated { get; set; } = false;
        public bool SpayedNeutered { get; set; } = false;
        public bool Microchipped { get; set; } = false;
        public bool GoodWithKids { get; set; } = false;
        public bool GoodWithPets { get; set; } = false;
        public bool GoodWithCats { get; set; } = false;

        [StringLength(20)]
        public string? EnergyLevel { get; set; }

        public decimal AdoptionFee { get; set; } = 0;

        public DateTime? RescueDate { get; set; }

        [StringLength(50)]
        public string HealthStatus { get; set; } = "Unknown";

        public bool SpecialNeeds { get; set; } = false;
        public bool HouseTrained { get; set; } = false;

        public string Personality { get; set; } = string.Empty; // JSON array

        [StringLength(50)]
        public string Status { get; set; } = "Available"; // Available, Adopted, Pending, Medical

        public Guid? OrganizationId { get; set; }
        public Organization? Organization { get; set; }

        public Guid? RescueReportId { get; set; }
        public RescueReport? RescueReport { get; set; }

        [StringLength(50)]
        public string? MicrochipId { get; set; }

        public bool? IsSpayedNeutered { get; set; }

        [StringLength(50)]
        public string? VaccinationStatus { get; set; }

        public bool IsFeatured { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<AnimalPhoto> Photos { get; set; } = new List<AnimalPhoto>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();

        // Backward compatibility properties
        [NotMapped]
        public string Type
        {
            get => Species;
            set => Species = value;
        }

        [NotMapped]
        public string? Age
        {
            get => AgeCategory;
            set => AgeCategory = value;
        }

        [NotMapped]
        public bool Featured
        {
            get => IsFeatured;
            set => IsFeatured = value;
        }
    }
}
