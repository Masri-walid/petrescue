using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Data
{
    public class PetRescueDbContext : DbContext
    {
        public PetRescueDbContext(DbContextOptions<PetRescueDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Animal> Animals { get; set; }
        public DbSet<RescueReport> RescueReports { get; set; }
        public DbSet<AdoptionApplication> AdoptionApplications { get; set; }
        public DbSet<UserOrganization> UserOrganizations { get; set; }
        public DbSet<AnimalPhoto> AnimalPhotos { get; set; }
        public DbSet<RescueReportPhoto> RescueReportPhotos { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Vaccination> Vaccinations { get; set; }
        public DbSet<UserPhoto> UserPhotos { get; set; }
        public DbSet<OrganizationHour> OrganizationHours { get; set; }
        public DbSet<OrganizationService> OrganizationServices { get; set; }
        public DbSet<OrganizationSpecialty> OrganizationSpecialties { get; set; }
        public DbSet<Characteristic> Characteristics { get; set; }
        public DbSet<PhotoCharacteristic> PhotoCharacteristics { get; set; }
        public DbSet<PhotoEmbedding> PhotoEmbeddings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure array types for PostgreSQL
            modelBuilder.Entity<Animal>()
                .Property(e => e.PersonalityTraits)
                .HasColumnType("text[]");

            modelBuilder.Entity<Animal>()
                .Property(e => e.MedicalConditions)
                .HasColumnType("text[]");

            modelBuilder.Entity<MedicalRecord>()
                .Property(e => e.Medications)
                .HasColumnType("text[]");

            // Configure PhotoEmbedding with double precision array
            modelBuilder.Entity<PhotoEmbedding>()
                .Property(e => e.Embedding)
                .HasColumnType("float8[]");

            // Configure JSONB type for PostgreSQL
            modelBuilder.Entity<AdoptionApplication>()
                .Property(e => e.ApplicationData)
                .HasColumnType("jsonb");

            // Configure point type for PostgreSQL coordinates - temporarily commented out
            // TODO: Configure proper point type mapping for PostgreSQL
            // modelBuilder.Entity<User>()
            //     .Property(e => e.Coordinates)
            //     .HasColumnType("point");

            // modelBuilder.Entity<Organization>()
            //     .Property(e => e.Coordinates)
            //     .HasColumnType("point");

            // modelBuilder.Entity<RescueReport>()
            //     .Property(e => e.Coordinates)
            //     .HasColumnType("point");

            // Configure vector type for embeddings - temporarily commented out
            // TODO: Configure proper vector type mapping for pgvector extension
            // modelBuilder.Entity<PhotoEmbedding>()
            //     .Property(e => e.Embedding)
            //     .HasColumnType("vector(512)");

            // Configure unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Favorite>()
                .HasIndex(e => new { e.UserId, e.AnimalId })
                .IsUnique();

            modelBuilder.Entity<PhotoCharacteristic>()
                .HasIndex(e => new { e.PhotoId, e.CharacteristicId })
                .IsUnique();

            modelBuilder.Entity<PhotoEmbedding>()
                .HasIndex(e => e.PhotoId)
                .IsUnique();

            // Configure relationships explicitly
            modelBuilder.Entity<AdoptionApplication>()
                .HasOne(a => a.Applicant)
                .WithMany(u => u.AdoptionApplications)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AdoptionApplication>()
                .HasOne(a => a.Animal)
                .WithMany(an => an.AdoptionApplications)
                .HasForeignKey(a => a.AnimalId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AdoptionApplication>()
                .HasOne(a => a.Organization)
                .WithMany()
                .HasForeignKey(a => a.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RescueReport>()
                .HasOne(r => r.Reporter)
                .WithMany(u => u.RescueReports)
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RescueReport>()
                .HasOne(r => r.AssignedOrganization)
                .WithMany(o => o.AssignedRescueReports)
                .HasForeignKey(r => r.AssignedOrganizationId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RescueReport>()
                .HasOne(r => r.AssignedVolunteer)
                .WithMany()
                .HasForeignKey(r => r.AssignedVolunteerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Animal>()
                .HasOne(a => a.Organization)
                .WithMany(o => o.Animals)
                .HasForeignKey(a => a.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Animal>()
                .HasOne(a => a.RescueReport)
                .WithMany(r => r.Animals)
                .HasForeignKey(a => a.RescueReportId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
