using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class AnimalDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Breed { get; set; }
        public string? Age { get; set; }
        public string? Gender { get; set; }
        public string? Size { get; set; }
        public string? Weight { get; set; }
        public string? Description { get; set; }
        public bool Vaccinated { get; set; }
        public bool SpayedNeutered { get; set; }
        public bool Microchipped { get; set; }
        public bool GoodWithKids { get; set; }
        public bool GoodWithPets { get; set; }
        public bool GoodWithCats { get; set; }
        public string? EnergyLevel { get; set; }
        public decimal AdoptionFee { get; set; }
        public bool Featured { get; set; }
        public DateTime? RescueDate { get; set; }
        public string HealthStatus { get; set; } = string.Empty;
        public bool SpecialNeeds { get; set; }
        public bool HouseTrained { get; set; }
        public string[] Personality { get; set; } = Array.Empty<string>();
        public string Status { get; set; } = string.Empty;
        public Guid? OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public List<AnimalPhotoDto> Photos { get; set; } = new();
        public List<MedicalRecordDto> MedicalRecords { get; set; } = new();
    }

    public class AnimalPhotoDto
    {
        public Guid Id { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class MedicalRecordDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? VeterinarianName { get; set; }
        public string? Clinic { get; set; }
        public DateTime Date { get; set; }
        public DateTime? NextDue { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateAnimalRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Breed { get; set; }

        [StringLength(20)]
        public string? Age { get; set; }

        [StringLength(20)]
        public string? AgeCategory { get; set; }

        public int? EstimatedAge { get; set; }

        [StringLength(100)]
        public string? Color { get; set; }

        [StringLength(10)]
        public string? Gender { get; set; }

        [StringLength(20)]
        public string? Size { get; set; }

        public decimal? Weight { get; set; }

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
        public bool Featured { get; set; } = false;
        public DateTime? RescueDate { get; set; }

        [StringLength(50)]
        public string HealthStatus { get; set; } = "Unknown";

        public bool SpecialNeeds { get; set; } = false;
        public bool HouseTrained { get; set; } = false;
        public string[] Personality { get; set; } = Array.Empty<string>();

        [StringLength(50)]
        public string Status { get; set; } = "Available";
    }

    public class UpdateAnimalRequest : CreateAnimalRequest
    {
    }
}
