using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Repositories
{
    public class OrganizationRepository : GenericRepository<Organization>, IOrganizationRepository
    {
        public OrganizationRepository(PetRescueDbContext context) : base(context)
        {
        }

        public async Task<Organization?> GetOrganizationWithDetailsAsync(Guid organizationId)
        {
            return await _dbSet
                .Include(o => o.OrganizationHours)
                .Include(o => o.OrganizationServices)
                .Include(o => o.Reviews)
                .FirstOrDefaultAsync(o => o.Id == organizationId);
        }

        public async Task<IEnumerable<Organization>> GetOrganizationsByTypeAsync(string organizationType)
        {
            return await _dbSet
                .Where(o => o.OrganizationType.ToLower() == organizationType.ToLower())
                .Include(o => o.OrganizationHours)
                .Include(o => o.OrganizationServices)
                .ToListAsync();
        }

        public async Task<IEnumerable<Organization>> SearchOrganizationsAsync(string searchTerm)
        {
            return await _dbSet
                .Where(o => o.Name.Contains(searchTerm) ||
                           o.Description!.Contains(searchTerm) ||
                           o.City.Contains(searchTerm) ||
                           o.State.Contains(searchTerm))
                .Include(o => o.OrganizationHours)
                .Include(o => o.OrganizationServices)
                .ToListAsync();
        }

        public async Task<IEnumerable<Organization>> GetNearbyOrganizationsAsync(double latitude, double longitude, double radiusKm)
        {
            // For now, return all organizations. In a real implementation, you would use PostGIS functions
            // to calculate distance based on the coordinates field
            return await _dbSet
                .Include(o => o.OrganizationHours)
                .Include(o => o.OrganizationServices)
                .ToListAsync();
        }
    }
}
