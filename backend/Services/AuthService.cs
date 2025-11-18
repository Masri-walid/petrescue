using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PetRescueConnect.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserDto> RegisterAsync(CreateUserDto createUserDto);
        Task<bool> EmailExistsAsync(string email);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly PetRescueDbContext _context;

        public AuthService(IUserRepository userRepository, IMapper mapper, IConfiguration configuration, PetRescueDbContext context)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
            _context = context;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            return new LoginResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<UserDto> RegisterAsync(CreateUserDto createUserDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = _mapper.Map<User>(createUserDto);
                user.PasswordHash = HashPassword(createUserDto.Password);
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                var createdUser = await _userRepository.AddAsync(user);

                // For shelter and veterinarian users, handle organization association
                if (createUserDto.UserType == "shelter" || createUserDto.UserType == "veterinarian")
                {
                    Guid organizationId;

                    if (!string.IsNullOrEmpty(createUserDto.OrganizationId))
                    {
                        // User selected an existing organization
                        organizationId = Guid.Parse(createUserDto.OrganizationId);
                    }
                    else if (createUserDto.CreateNewOrganization == true)
                    {
                        // User chose to create a new organization - create a placeholder for now
                        // They will be redirected to complete organization registration
                        var organization = new Organization
                        {
                            Name = $"{createdUser.FirstName} {createdUser.LastName}'s {(createUserDto.UserType == "shelter" ? "Shelter" : "Veterinary Clinic")}",
                            OrganizationType = createUserDto.UserType == "shelter" ? "shelter" : "veterinary_clinic",
                            Description = $"Professional {createUserDto.UserType} services - Registration pending completion",
                            Address = createUserDto.Address ?? "Address not provided",
                            City = createUserDto.City ?? "City not provided",
                            State = createUserDto.State ?? "State not provided",
                            ZipCode = createUserDto.ZipCode ?? "00000",
                            Coordinates = createUserDto.Coordinates ?? "POINT(0 0)",
                            Phone = createUserDto.Phone ?? "Phone not provided",
                            Email = createUserDto.Email,
                            IsVerified = false,
                            IsActive = false, // Set to false until organization registration is completed
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Organizations.Add(organization);
                        await _context.SaveChangesAsync();
                        organizationId = organization.Id;
                    }
                    else
                    {
                        // Fallback: create a default organization (for backward compatibility)
                        var organization = new Organization
                        {
                            Name = $"{createdUser.FirstName} {createdUser.LastName}'s {(createUserDto.UserType == "shelter" ? "Shelter" : "Veterinary Clinic")}",
                            OrganizationType = createUserDto.UserType == "shelter" ? "shelter" : "veterinary_clinic",
                            Description = $"Professional {createUserDto.UserType} services",
                            Address = createUserDto.Address ?? "Address not provided",
                            City = createUserDto.City ?? "City not provided",
                            State = createUserDto.State ?? "State not provided",
                            ZipCode = createUserDto.ZipCode ?? "00000",
                            Coordinates = createUserDto.Coordinates ?? "POINT(0 0)",
                            Phone = createUserDto.Phone ?? "Phone not provided",
                            Email = createUserDto.Email,
                            IsVerified = false,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Organizations.Add(organization);
                        await _context.SaveChangesAsync();
                        organizationId = organization.Id;
                    }

                    // Create user-organization relationship
                    var userOrganization = new UserOrganization
                    {
                        UserId = createdUser.Id,
                        OrganizationId = organizationId,
                        Role = !string.IsNullOrEmpty(createUserDto.OrganizationId) ? "member" : "owner",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.UserOrganizations.Add(userOrganization);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return _mapper.Map<UserDto>(createdUser);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.EmailExistsAsync(email);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expirationInMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("user_type", user.UserType)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[16];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            var hashBytes = new byte[48];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 32);

            return Convert.ToBase64String(hashBytes);
        }

        private static bool VerifyPassword(string password, string hashedPassword)
        {
            var hashBytes = Convert.FromBase64String(hashedPassword);
            var salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            for (int i = 0; i < 32; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                    return false;
            }

            return true;
        }
    }
}
