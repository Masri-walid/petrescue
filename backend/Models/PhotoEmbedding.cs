using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetRescueConnect.API.Models
{
    [Table("photo_embedding")]
    public class PhotoEmbedding
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("photo_id")]
        public Guid PhotoId { get; set; }

        [Required]
        [Column("embedding")]
        public double[] Embedding { get; set; } = new double[0]; // PostgreSQL float8[] array

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PhotoId")]
        public virtual RescueReportPhoto Photo { get; set; } = null!;
    }
}
