using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Data
{
    public class PetRescueDbContext : DbContext
    {
        public PetRescueDbContext(DbContextOptions<PetRescueDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Animal> Animals { get; set; }
        public DbSet<RescueReport> RescueReports { get; set; }
        public DbSet<AdoptionApplication> AdoptionApplications { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<AnimalPhoto> AnimalPhotos { get; set; }
        public DbSet<RescuePhoto> RescuePhotos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names to match database schema
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Organization>().ToTable("organizations");
            modelBuilder.Entity<Animal>().ToTable("animals");
            modelBuilder.Entity<RescueReport>().ToTable("rescue_reports");
            modelBuilder.Entity<AdoptionApplication>().ToTable("adoption_applications");
            modelBuilder.Entity<MedicalRecord>().ToTable("medical_records");
            modelBuilder.Entity<AnimalPhoto>().ToTable("animal_photos");
            modelBuilder.Entity<RescuePhoto>().ToTable("rescue_report_photos");

            // Configure User column mappings to match database schema
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.FirstName).HasColumnName("first_name");
                entity.Property(e => e.LastName).HasColumnName("last_name");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.UserType).HasColumnName("user_type");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.State).HasColumnName("state");
                entity.Property(e => e.ZipCode).HasColumnName("zip_code");
                entity.Property(e => e.Latitude).HasColumnName("latitude");
                entity.Property(e => e.Longitude).HasColumnName("longitude");
                entity.Property(e => e.ProfileImageUrl).HasColumnName("profile_image_url");
                entity.Property(e => e.IsVerified).HasColumnName("is_verified");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            });

            // Configure Organization column mappings to match database schema
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.OrganizationType).HasColumnName("organization_type");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.State).HasColumnName("state");
                entity.Property(e => e.ZipCode).HasColumnName("zip_code");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Website).HasColumnName("website");
                entity.Property(e => e.LicenseNumber).HasColumnName("license_number");
                entity.Property(e => e.Capacity).HasColumnName("capacity");
                entity.Property(e => e.CurrentAnimalCount).HasColumnName("current_animal_count");
                entity.Property(e => e.Rating).HasColumnName("rating");
                entity.Property(e => e.ReviewCount).HasColumnName("review_count");
                entity.Property(e => e.IsFeatured).HasColumnName("is_featured");
                entity.Property(e => e.IsVerified).HasColumnName("is_verified");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                // Map the POINT column for spatial coordinates
                entity.Property(e => e.Coordinates).HasColumnName("coordinates");
                // Latitude and Longitude are computed properties, not mapped to database
            });

            // Configure Animal column mappings to match database schema
            modelBuilder.Entity<Animal>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Species).HasColumnName("species");
                entity.Property(e => e.Breed).HasColumnName("breed");
                entity.Property(e => e.AgeCategory).HasColumnName("age_category");
                entity.Property(e => e.EstimatedAge).HasColumnName("estimated_age");
                entity.Property(e => e.Gender).HasColumnName("gender");
                entity.Property(e => e.Size).HasColumnName("size");
                entity.Property(e => e.Color).HasColumnName("color");
                entity.Property(e => e.Weight).HasColumnName("weight");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.MicrochipId).HasColumnName("microchip_id");
                entity.Property(e => e.IsSpayedNeutered).HasColumnName("is_spayed_neutered");
                entity.Property(e => e.VaccinationStatus).HasColumnName("vaccination_status");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
                entity.Property(e => e.RescueReportId).HasColumnName("rescue_report_id");
                entity.Property(e => e.AdoptionFee).HasColumnName("adoption_fee");
                entity.Property(e => e.IsFeatured).HasColumnName("is_featured");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                // Handle array columns - for now we'll ignore them as they need special handling
                entity.Ignore(e => e.Personality);
                entity.Ignore(e => e.Vaccinated);
                entity.Ignore(e => e.SpayedNeutered);
                entity.Ignore(e => e.Microchipped);
                entity.Ignore(e => e.GoodWithKids);
                entity.Ignore(e => e.GoodWithPets);
                entity.Ignore(e => e.GoodWithCats);
                entity.Ignore(e => e.EnergyLevel);
                entity.Ignore(e => e.Featured);
                entity.Ignore(e => e.RescueDate);
                entity.Ignore(e => e.HealthStatus);
                entity.Ignore(e => e.SpecialNeeds);
                entity.Ignore(e => e.HouseTrained);
            });

            // Configure other model column mappings
            modelBuilder.Entity<RescueReport>(entity =>
            {
                entity.ToTable("rescue_reports");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ReporterId).HasColumnName("reporter_id");
                entity.Property(e => e.AnimalType).HasColumnName("animal_type");
                entity.Property(e => e.UrgencyLevel).HasColumnName("urgency_level");
                entity.Property(e => e.AnimalCondition).HasColumnName("animal_condition");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Location).HasColumnName("location_address");
                entity.Property(e => e.ReporterName).HasColumnName("contact_name");
                entity.Property(e => e.ReporterPhone).HasColumnName("contact_phone");
                entity.Property(e => e.ReporterEmail).HasColumnName("contact_email");
                entity.Property(e => e.Status).HasColumnName("status");
                entity.Property(e => e.AssignedOrganizationId).HasColumnName("assigned_organization_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                // Temporarily ignore the POINT column until PostGIS is installed
                entity.Ignore(e => e.Coordinates);
                // Latitude and Longitude are computed properties, not mapped to database

                // Properties that don't have corresponding database columns are ignored
                entity.Ignore(e => e.Breed);
                entity.Ignore(e => e.Size);
                entity.Ignore(e => e.Color);
                entity.Ignore(e => e.InjuredOrSick);
                entity.Ignore(e => e.InjuryDescription);
            });

            modelBuilder.Entity<AdoptionApplication>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.AnimalId).HasColumnName("animal_id");
                entity.Property(e => e.ApplicantId).HasColumnName("applicant_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            });

            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.AnimalId).HasColumnName("animal_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            });

            modelBuilder.Entity<AnimalPhoto>(entity =>
            {
                entity.ToTable("animal_photos");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.AnimalId).HasColumnName("animal_id");
                entity.Property(e => e.PhotoUrl).HasColumnName("photo_url");
                entity.Property(e => e.Caption).HasColumnName("caption");
                entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
                entity.Property(e => e.DisplayOrder).HasColumnName("display_order");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            });

            modelBuilder.Entity<RescuePhoto>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.RescueReportId).HasColumnName("rescue_report_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            });

            // Animal relationships
            modelBuilder.Entity<Animal>()
                .HasOne(a => a.Organization)
                .WithMany(o => o.Animals)
                .HasForeignKey(a => a.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Animal>()
                .HasMany(a => a.Photos)
                .WithOne(p => p.Animal)
                .HasForeignKey(p => p.AnimalId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Animal>()
                .HasMany(a => a.MedicalRecords)
                .WithOne(m => m.Animal)
                .HasForeignKey(m => m.AnimalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Rescue Report relationships
            modelBuilder.Entity<RescueReport>()
                .HasOne(r => r.Reporter)
                .WithMany(u => u.RescueReports)
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RescueReport>()
                .HasOne(r => r.AssignedOrganization)
                .WithMany(o => o.AssignedRescues)
                .HasForeignKey(r => r.AssignedOrganizationId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RescueReport>()
                .HasMany(r => r.Photos)
                .WithOne(p => p.RescueReport)
                .HasForeignKey(p => p.RescueReportId)
                .OnDelete(DeleteBehavior.Cascade);

            // Adoption Application relationships
            modelBuilder.Entity<AdoptionApplication>()
                .HasOne(a => a.Animal)
                .WithMany(an => an.AdoptionApplications)
                .HasForeignKey(a => a.AnimalId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdoptionApplication>()
                .HasOne(a => a.Applicant)
                .WithMany(u => u.AdoptionApplications)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            modelBuilder.Entity<Animal>()
                .HasIndex(a => new { a.Species, a.Status })
                .HasDatabaseName("IX_Animal_Species_Status");

            // Note: Organization location index removed since Latitude/Longitude are ignored
            // Database uses POINT column for coordinates

            // Note: RescueReport location index removed since Latitude/Longitude are ignored
            // Database uses POINT column for coordinates

            // Note: Organization coordinate precision removed since Latitude/Longitude are ignored

            // Note: RescueReport coordinate precision removed since Latitude/Longitude are ignored
        }
    }
}
