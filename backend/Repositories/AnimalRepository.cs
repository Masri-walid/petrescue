using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Repositories
{
    public class AnimalRepository : GenericRepository<Animal>, IAnimalRepository
    {
        public AnimalRepository(PetRescueDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Animal>> GetAvailableAnimalsAsync()
        {
            return await _dbSet
                .Where(a => a.Status == "available")
                .Include(a => a.AnimalPhotos)
                .Include(a => a.Organization)
                .ToListAsync();
        }

        public async Task<IEnumerable<Animal>> GetAnimalsByOrganizationAsync(Guid organizationId)
        {
            return await _dbSet
                .Where(a => a.OrganizationId == organizationId)
                .Include(a => a.AnimalPhotos)
                .ToListAsync();
        }

        public async Task<IEnumerable<Animal>> GetAnimalsBySpeciesAsync(string species)
        {
            return await _dbSet
                .Where(a => a.Species.ToLower() == species.ToLower())
                .Include(a => a.AnimalPhotos)
                .Include(a => a.Organization)
                .ToListAsync();
        }

        public async Task<Animal?> GetAnimalWithPhotosAsync(Guid animalId)
        {
            return await _dbSet
                .Include(a => a.AnimalPhotos)
                .Include(a => a.Organization)
                .Include(a => a.MedicalRecords)
                .Include(a => a.Vaccinations)
                .FirstOrDefaultAsync(a => a.Id == animalId);
        }

        public async Task<IEnumerable<Animal>> GetFeaturedAnimalsAsync()
        {
            return await _dbSet
                .Where(a => a.IsFeatured && a.Status == "available")
                .Include(a => a.AnimalPhotos)
                .Include(a => a.Organization)
                .ToListAsync();
        }

        public async Task<IEnumerable<Animal>> SearchAnimalsAsync(string searchTerm)
        {
            return await _dbSet
                .Where(a => a.Name!.Contains(searchTerm) ||
                           a.Species.Contains(searchTerm) ||
                           a.Breed!.Contains(searchTerm) ||
                           a.Description!.Contains(searchTerm))
                .Include(a => a.AnimalPhotos)
                .Include(a => a.Organization)
                .ToListAsync();
        }
    }
}
