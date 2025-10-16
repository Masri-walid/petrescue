using System.ComponentModel.DataAnnotations;

namespace PetRescueConnect.API.Models
{
    public class RescuePhoto
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid RescueReportId { get; set; }
        public RescueReport RescueReport { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [Required]
        public byte[] PhotoData { get; set; } = Array.Empty<byte>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
