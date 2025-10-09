using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PetRescueConnect.API.Services;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Debug logging
            Console.WriteLine($"Registration request received:");
            Console.WriteLine($"FirstName: '{request?.FirstName}'");
            Console.WriteLine($"LastName: '{request?.LastName}'");
            Console.WriteLine($"Email: '{request?.Email}'");
            Console.WriteLine($"Password: '{(string.IsNullOrEmpty(request?.Password) ? "EMPTY" : "PROVIDED")}'");
            Console.WriteLine($"Phone: '{request?.Phone}'");
            Console.WriteLine($"Role: '{request?.Role}'");
            Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");

            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState errors:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"  {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request);

            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDto
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
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.Phone = request.Phone;

            var result = await _authService.UpdateUserAsync(user);
            if (!result)
            {
                return BadRequest("Failed to update profile");
            }

            return Ok(new UserDto
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
            });
        }

        [HttpPost("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok(new { valid = true, message = "Token is valid" });
        }
    }
}
