using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> UpdateUserAsync(User user);
        string GenerateJwtToken(User user);
        bool VerifyPassword(string password, string hash);
        string HashPassword(string password);
    }
}
