using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class AnimalDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string Species { get; set; } = string.Empty;
        public string? Breed { get; set; }
        public string? AgeCategory { get; set; }
        public int? EstimatedAge { get; set; }
        public string? Gender { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public decimal? Weight { get; set; }
        public string? Description { get; set; }
        public string[]? PersonalityTraits { get; set; }
        public string[]? MedicalConditions { get; set; }
        public string? SpecialNeeds { get; set; }
        public string? MicrochipId { get; set; }
        public bool? IsSpayedNeutered { get; set; }
        public string? VaccinationStatus { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? OrganizationId { get; set; }
        public Guid? RescueReportId { get; set; }
        public decimal? AdoptionFee { get; set; }
        public bool IsFeatured { get; set; }
        public decimal? AdoptionLikelihood { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public OrganizationDto? Organization { get; set; }
        public List<AnimalPhotoDto> AnimalPhotos { get; set; } = new();
    }

    public class CreateAnimalDto
    {
        public string? Name { get; set; }

        [Required]
        public string Species { get; set; } = string.Empty;

        public string? Breed { get; set; }
        public string? AgeCategory { get; set; }
        public int? EstimatedAge { get; set; }
        public string? Gender { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public decimal? Weight { get; set; }
        public string? Description { get; set; }
        public string[]? PersonalityTraits { get; set; }
        public string[]? MedicalConditions { get; set; }
        public string? SpecialNeeds { get; set; }
        public string? MicrochipId { get; set; }
        public bool? IsSpayedNeutered { get; set; }
        public string? VaccinationStatus { get; set; }
        public string Status { get; set; } = "available";
        public Guid? OrganizationId { get; set; }
        public Guid? RescueReportId { get; set; }
        public decimal? AdoptionFee { get; set; }
        public bool IsFeatured { get; set; } = false;
    }

    public class UpdateAnimalDto
    {
        public string? Name { get; set; }
        public string? Breed { get; set; }
        public string? AgeCategory { get; set; }
        public int? EstimatedAge { get; set; }
        public string? Gender { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public decimal? Weight { get; set; }
        public string? Description { get; set; }
        public string[]? PersonalityTraits { get; set; }
        public string[]? MedicalConditions { get; set; }
        public string? SpecialNeeds { get; set; }
        public string? MicrochipId { get; set; }
        public bool? IsSpayedNeutered { get; set; }
        public string? VaccinationStatus { get; set; }
        public string? Status { get; set; }
        public decimal? AdoptionFee { get; set; }
        public bool? IsFeatured { get; set; }
    }

    public class AnimalPhotoDto
    {
        public Guid Id { get; set; }
        public Guid AnimalId { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
