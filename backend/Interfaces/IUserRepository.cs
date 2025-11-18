using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetUserWithOrganizationsAsync(Guid userId);
        Task<IEnumerable<User>> GetUsersByTypeAsync(string userType);
        Task<bool> EmailExistsAsync(string email);
    }
}
