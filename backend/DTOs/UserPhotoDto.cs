using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.DTOs
{
    public class UserPhotoDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserPhotoDto
    {
        [Required]
        public string PhotoUrl { get; set; } = string.Empty;
        
        public string? Caption { get; set; }
        
        public bool IsPrimary { get; set; } = false;
    }

    public class UpdateUserPhotoDto
    {
        public string? Caption { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
