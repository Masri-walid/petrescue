using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace PetRescueConnect.API.Models
{
    public class Organization
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string OrganizationType { get; set; } = string.Empty; // shelter, rescue, veterinary_clinic, sanctuary

        public string? Description { get; set; }

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string ZipCode { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Website { get; set; }

        [StringLength(100)]
        public string? LicenseNumber { get; set; }

        // Spatial data using PostGIS POINT column
        public Point Coordinates { get; set; } = null!;

        // Computed properties for backward compatibility
        [NotMapped]
        public decimal Latitude
        {
            get => (decimal)(Coordinates?.Y ?? 0);
            set
            {
                if (Coordinates == null)
                    Coordinates = new Point(0, (double)value) { SRID = 4326 };
                else
                    Coordinates = new Point(Coordinates.X, (double)value) { SRID = 4326 };
            }
        }

        [NotMapped]
        public decimal Longitude
        {
            get => (decimal)(Coordinates?.X ?? 0);
            set
            {
                if (Coordinates == null)
                    Coordinates = new Point((double)value, 0) { SRID = 4326 };
                else
                    Coordinates = new Point((double)value, Coordinates.Y) { SRID = 4326 };
            }
        }

        public decimal Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;

        public int? Capacity { get; set; }
        public int CurrentAnimalCount { get; set; } = 0;

        public bool IsFeatured { get; set; } = false;
        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Animal> Animals { get; set; } = new List<Animal>();
        public ICollection<RescueReport> AssignedRescues { get; set; } = new List<RescueReport>();

        // Backward compatibility properties
        [NotMapped]
        public string Type
        {
            get => OrganizationType;
            set => OrganizationType = value;
        }

        [NotMapped]
        public bool Featured
        {
            get => IsFeatured;
            set => IsFeatured = value;
        }

        [NotMapped]
        public int CurrentAnimals
        {
            get => CurrentAnimalCount;
            set => CurrentAnimalCount = value;
        }
    }
}
