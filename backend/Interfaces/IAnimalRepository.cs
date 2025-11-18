using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Interfaces
{
    public interface IAnimalRepository : IGenericRepository<Animal>
    {
        Task<IEnumerable<Animal>> GetAvailableAnimalsAsync();
        Task<IEnumerable<Animal>> GetAnimalsByOrganizationAsync(Guid organizationId);
        Task<IEnumerable<Animal>> GetAnimalsBySpeciesAsync(string species);
        Task<Animal?> GetAnimalWithPhotosAsync(Guid animalId);
        Task<IEnumerable<Animal>> GetFeaturedAnimalsAsync();
        Task<IEnumerable<Animal>> SearchAnimalsAsync(string searchTerm);
    }
}
