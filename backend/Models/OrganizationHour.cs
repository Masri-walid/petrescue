using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("organization_hours")]
    public class OrganizationHour
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Required]
        [Column("day_of_week")]
        public int DayOfWeek { get; set; }

        [Column("open_time")]
        public TimeOnly? OpenTime { get; set; }

        [Column("close_time")]
        public TimeOnly? CloseTime { get; set; }

        [Column("is_closed")]
        public bool IsClosed { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("OrganizationId")]
        public virtual Organization Organization { get; set; } = null!;
    }
}
