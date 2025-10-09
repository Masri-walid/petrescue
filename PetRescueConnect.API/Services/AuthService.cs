using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly PetRescueDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(PetRescueDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User with this email already exists"
                };
            }

            // Create new user
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                UserType = request.Role ?? "citizen",
                PasswordHash = HashPassword(request.Password),
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Registration successful",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role,
                    Address = user.Address,
                    City = user.City,
                    State = user.State,
                    ZipCode = user.ZipCode,
                    Latitude = user.Latitude,
                    Longitude = user.Longitude,
                    ProfileImageUrl = user.ProfileImageUrl,
                    IsActive = user.IsActive,
                    IsVerified = user.IsVerified
                }
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role,
                    Address = user.Address,
                    City = user.City,
                    State = user.State,
                    ZipCode = user.ZipCode,
                    Latitude = user.Latitude,
                    Longitude = user.Longitude,
                    ProfileImageUrl = user.ProfileImageUrl,
                    IsActive = user.IsActive,
                    IsVerified = user.IsVerified
                }
            };
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpiryInHours"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                return false;
            }
        }
    }
}
