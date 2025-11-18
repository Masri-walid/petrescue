using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column("user_type")]
        [MaxLength(50)]
        public string UserType { get; set; } = string.Empty;

        [Required]
        [Column("first_name")]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("last_name")]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Column("phone")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("city")]
        [MaxLength(100)]
        public string? City { get; set; }

        [Column("state")]
        [MaxLength(50)]
        public string? State { get; set; }

        [Column("zip_code")]
        [MaxLength(10)]
        public string? ZipCode { get; set; }

        [Column("coordinates")]
        public string? Coordinates { get; set; } // PostgreSQL point type as string

        [Column("profile_image_url")]
        public string? ProfileImageUrl { get; set; }

        [Column("profile_image_data")]
        public byte[]? ProfileImageData { get; set; }

        [Column("profile_image_content_type")]
        public string? ProfileImageContentType { get; set; }

        [Column("profile_image_file_name")]
        public string? ProfileImageFileName { get; set; }

        [Column("profile_image_file_size")]
        public long? ProfileImageFileSize { get; set; }

        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed property for profile image URL
        // Include a version query string based on UpdatedAt so browsers fetch the latest image
        [NotMapped]
        public string? ComputedProfileImageUrl =>
            ProfileImageData != null
                ? $"/api/images/profile/{Id}?v={UpdatedAt.Ticks}"
                : ProfileImageUrl;

        // Navigation properties
        public virtual ICollection<UserOrganization> UserOrganizations { get; set; } = new List<UserOrganization>();
        public virtual ICollection<RescueReport> RescueReports { get; set; } = new List<RescueReport>();
        public virtual ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();
        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<UserPhoto> UserPhotos { get; set; } = new List<UserPhoto>();
    }
}
