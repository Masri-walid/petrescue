using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(PetRescueDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserWithOrganizationsAsync(Guid userId)
        {
            return await _dbSet
                .Include(u => u.UserOrganizations)
                .ThenInclude(uo => uo.Organization)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<IEnumerable<User>> GetUsersByTypeAsync(string userType)
        {
            return await _dbSet
                .Where(u => u.UserType == userType)
                .ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }
    }
}
