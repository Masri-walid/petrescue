using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Interfaces
{
    public interface IOrganizationRepository : IGenericRepository<Organization>
    {
        Task<Organization?> GetOrganizationWithDetailsAsync(Guid organizationId);
        Task<IEnumerable<Organization>> GetOrganizationsByTypeAsync(string organizationType);
        Task<IEnumerable<Organization>> SearchOrganizationsAsync(string searchTerm);
        Task<IEnumerable<Organization>> GetNearbyOrganizationsAsync(double latitude, double longitude, double radiusKm);
    }
}
