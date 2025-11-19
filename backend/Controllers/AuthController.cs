using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Services;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.Data;
using System.Security.Claims;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly PetRescueDbContext _context;

        public AuthController(IAuthService authService, IUserRepository userRepository, IMapper mapper, PetRescueDbContext context)
        {
            _authService = authService;
            _userRepository = userRepository;
            _mapper = mapper;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto);
                if (result == null)
                {
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                return Ok(new {
                    success = true,
                    message = "Login successful",
                    token = result.Token,
                    user = new
                    {
                        id = result.User.Id.ToString(),
                        firstName = result.User.FirstName,
                        lastName = result.User.LastName,
                        email = result.User.Email,
                        role = result.User.UserType,
                        userType = result.User.UserType,
                        phone = result.User.Phone,
                        profileImageUrl = result.User.ProfileImageUrl,
                        isActive = result.User.IsActive,
                        isVerified = result.User.IsVerified
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                // Check if email already exists
                if (await _authService.EmailExistsAsync(createUserDto.Email))
                {
                    return BadRequest(new { success = false, message = "Email already exists" });
                }

                var user = await _authService.RegisterAsync(createUserDto);

                // Generate token for the new user
                var loginDto = new LoginDto { Email = createUserDto.Email, Password = createUserDto.Password };
                var loginResult = await _authService.LoginAsync(loginDto);

                return Ok(new {
                    success = true,
                    message = "Registration successful",
                    token = loginResult?.Token ?? "temp-token",
                    user = new
                    {
                        id = user.Id.ToString(),
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email,
                        role = user.UserType,
                        userType = user.UserType,
                        phone = user.Phone,
                        profileImageUrl = user.ProfileImageUrl,
                        isActive = user.IsActive,
                        isVerified = user.IsVerified
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred during registration", error = ex.Message });
            }
        }

        [HttpGet("check-email/{email}")]
        public async Task<ActionResult<bool>> CheckEmailExists(string email)
        {
            try
            {
                var exists = await _authService.EmailExistsAsync(email);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<object>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var user = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Get active organization for veterinarians and shelters
                var activeOrganization = user.UserOrganizations?.FirstOrDefault(uo => uo.IsActive);

                return Ok(new
                {
                    id = user.Id.ToString(),
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    role = user.UserType,
                    userType = user.UserType,
                    phone = user.Phone,
                    address = user.Address,
                    city = user.City,
                    state = user.State,
                    zipCode = user.ZipCode,
                    profileImageUrl = user.ComputedProfileImageUrl,
                    isActive = user.IsActive,
                    isVerified = user.IsVerified,
                    organizationId = activeOrganization?.OrganizationId.ToString(),
                    organizationName = activeOrganization?.Organization?.Name,
                    organizationRole = activeOrganization?.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("fix-organization-associations")]
        [Authorize]
        public async Task<ActionResult> FixOrganizationAssociations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return BadRequest(new { success = false, message = "Invalid user ID" });
                }

                if (userRole != "shelter" && userRole != "veterinarian")
                {
                    return BadRequest(new { success = false, message = "Only shelter and veterinarian users need organization associations" });
                }

                var user = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Check if user already has an active organization
                var hasActiveOrg = user.UserOrganizations?.Any(uo => uo.IsActive) == true;
                if (hasActiveOrg)
                {
                    return Ok(new { success = true, message = "User already has an active organization" });
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                // Create organization for the user
                var organization = new Organization
                {
                    Name = $"{user.FirstName} {user.LastName}'s {(userRole == "shelter" ? "Shelter" : "Veterinary Clinic")}",
                    OrganizationType = userRole == "shelter" ? "shelter" : "veterinary_clinic",
                    Description = $"Professional {userRole} services",
                    Address = "Address not provided",
                    City = "City not provided",
                    State = "State not provided",
                    ZipCode = "00000",
                    Coordinates = "POINT(0 0)",
                    Phone = user.Phone ?? "Phone not provided",
                    Email = user.Email,
                    IsVerified = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Organizations.Add(organization);
                await _context.SaveChangesAsync();

                // Create user-organization relationship
                var userOrganization = new UserOrganization
                {
                    UserId = user.Id,
                    OrganizationId = organization.Id,
                    Role = "owner",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserOrganizations.Add(userOrganization);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Organization association created successfully", organizationId = organization.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<object>> UpdateProfile([FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var user = await _userRepository.GetByIdAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Update user properties using AutoMapper
                _mapper.Map(updateUserDto, user);

                user.UpdatedAt = DateTime.UtcNow;

                var updatedUser = await _userRepository.UpdateAsync(user);

                return Ok(new
                {
                    success = true,
                    message = "Profile updated successfully",
                    user = new
                    {
                        id = updatedUser.Id.ToString(),
                        firstName = updatedUser.FirstName,
                        lastName = updatedUser.LastName,
                        email = updatedUser.Email,
                        role = updatedUser.UserType,
                        userType = updatedUser.UserType,
                        phone = updatedUser.Phone,
                        address = updatedUser.Address,
                        city = updatedUser.City,
                        state = updatedUser.State,
                        zipCode = updatedUser.ZipCode,
                        profileImageUrl = updatedUser.ComputedProfileImageUrl,
                        isActive = updatedUser.IsActive,
                        isVerified = updatedUser.IsVerified
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("users/by-type")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetUsersByType([FromQuery] string? userType = null)
        {
            try
            {
                IEnumerable<User> users;

                if (!string.IsNullOrEmpty(userType))
                {
                    users = await _userRepository.GetUsersByTypeAsync(userType);
                }
                else
                {
                    // Default to getting vets and shelters only
                    var vets = await _userRepository.GetUsersByTypeAsync("veterinarian");
                    var shelters = await _userRepository.GetUsersByTypeAsync("shelter");
                    users = vets.Concat(shelters);
                }

                var userDtos = new List<object>();

                foreach (var user in users)
                {
                    // Get user photos for each user
                    var userPhotos = await _context.UserPhotos
                        .Where(p => p.UserId == user.Id)
                        .OrderByDescending(p => p.IsPrimary)
                        .ThenByDescending(p => p.CreatedAt)
                        .ToListAsync();

                    var userDto = _mapper.Map<UserDto>(user);
                    var photoDtos = _mapper.Map<IEnumerable<UserPhotoDto>>(userPhotos);

                    userDtos.Add(new
                    {
                        Id = userDto.Id,
                        Email = userDto.Email,
                        UserType = userDto.UserType,
                        FirstName = userDto.FirstName,
                        LastName = userDto.LastName,
                        Phone = userDto.Phone,
                        Address = userDto.Address,
                        City = userDto.City,
                        State = userDto.State,
                        ZipCode = userDto.ZipCode,
                        Coordinates = userDto.Coordinates,
                        ProfileImageUrl = user.ComputedProfileImageUrl,
                        IsVerified = userDto.IsVerified,
                        IsActive = userDto.IsActive,
                        CreatedAt = userDto.CreatedAt,
                        UpdatedAt = userDto.UpdatedAt,
                        UserPhotos = photoDtos
                    });
                }

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
