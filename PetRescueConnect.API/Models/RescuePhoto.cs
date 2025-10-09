using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.Models
{
    public class RescuePhoto
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid RescueReportId { get; set; }
        public RescueReport RescueReport { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [StringLength(255)]
        public string? FileName { get; set; }

        [StringLength(100)]
        public string? ContentType { get; set; }

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
