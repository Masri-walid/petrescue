using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using System.Security.Claims;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly PetRescueDbContext _context;
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(PetRescueDbContext context, ILogger<ImagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("upload/profile")]
        [Authorize]
        public async Task<ActionResult<object>> UploadProfileImage(IFormFile file)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size too large. Maximum size is 5MB." });
                }

                // Get user
                var user = await _context.Users.FindAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Convert file to byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var photoData = memoryStream.ToArray();

                // Update user with image data
                user.ProfileImageData = photoData;
                user.ProfileImageContentType = file.ContentType;
                user.ProfileImageFileName = file.FileName;
                user.ProfileImageFileSize = file.Length;
                // Clear external URL since we're storing binary data
                user.ProfileImageUrl = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Profile image uploaded successfully",
                    imageUrl = user.ComputedProfileImageUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile image");
                return StatusCode(500, new { message = "An error occurred while uploading the image", error = ex.Message });
            }
        }

        [HttpGet("profile/{userId}")]
        public async Task<ActionResult> GetProfileImage(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.ProfileImageData == null)
                {
                    return NotFound();
                }

                return File(user.ProfileImageData, user.ProfileImageContentType ?? "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile image for user {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving the image" });
            }
        }

        [HttpPost("upload/user-photo")]
        [Authorize]
        public async Task<ActionResult<object>> UploadUserPhoto(IFormFile file, [FromForm] string? caption = null, [FromForm] bool isPrimary = false)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Only allow shelters and vets to add photos
                if (userRole != "shelter" && userRole != "veterinarian")
                {
                    return Forbid("Only shelters and veterinarians can add photos");
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size too large. Maximum size is 5MB." });
                }

                // Convert file to byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var photoData = memoryStream.ToArray();

                // If this is set as primary, make sure no other photos are primary
                if (isPrimary)
                {
                    var existingPrimary = await _context.UserPhotos
                        .Where(p => p.UserId == userGuid && p.IsPrimary)
                        .ToListAsync();

                    foreach (var photo in existingPrimary)
                    {
                        photo.IsPrimary = false;
                    }
                }

                // Create user photo record
                var userPhoto = new UserPhoto
                {
                    UserId = userGuid,
                    PhotoData = photoData,
                    ContentType = file.ContentType,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    Caption = caption,
                    IsPrimary = isPrimary,
                    CreatedAt = DateTime.UtcNow
                };

                // Ensure photo_url (NOT NULL in DB) is populated
                userPhoto.PhotoUrl = $"/api/images/user-photo/{userPhoto.Id}";

                _context.UserPhotos.Add(userPhoto);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Photo uploaded successfully",
                    photo = new
                    {
                        id = userPhoto.Id,
                        imageUrl = $"/api/images/user-photo/{userPhoto.Id}",
                        caption = userPhoto.Caption,
                        isPrimary = userPhoto.IsPrimary,
                        createdAt = userPhoto.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading user photo");
                return StatusCode(500, new { message = "An error occurred while uploading the photo", error = ex.Message });
            }
        }

        [HttpGet("user-photo/{photoId}")]
        public async Task<ActionResult> GetUserPhoto(Guid photoId)
        {
            try
            {
                var photo = await _context.UserPhotos.FindAsync(photoId);
                if (photo == null || photo.PhotoData == null)
                {
                    return NotFound();
                }

                return File(photo.PhotoData, photo.ContentType ?? "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user photo {PhotoId}", photoId);
                return StatusCode(500, new { message = "An error occurred while retrieving the photo" });
            }
        }

        [HttpPost("upload/animal-photo")]
        [Authorize]
        public async Task<ActionResult<object>> UploadAnimalPhoto(IFormFile file, [FromForm] Guid animalId, [FromForm] string? caption = null, [FromForm] bool isPrimary = false, [FromForm] int displayOrder = 0)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Only allow shelters and vets to add animal photos
                if (userRole != "shelter" && userRole != "veterinarian")
                {
                    return Forbid("Only shelters and veterinarians can add animal photos");
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size too large. Maximum size is 5MB." });
                }

                // Verify animal exists
                var animal = await _context.Animals.FindAsync(animalId);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                // Convert file to byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var photoData = memoryStream.ToArray();

                // If this is set as primary, make sure no other photos are primary for this animal
                if (isPrimary)
                {
                    var existingPrimary = await _context.AnimalPhotos
                        .Where(p => p.AnimalId == animalId && p.IsPrimary)
                        .ToListAsync();

                    foreach (var photo in existingPrimary)
                    {
                        photo.IsPrimary = false;
                    }
                }

                // Create animal photo record
                var animalPhoto = new AnimalPhoto
                {
                    AnimalId = animalId,
                    PhotoData = photoData,
                    ContentType = file.ContentType,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    Caption = caption,
                    IsPrimary = isPrimary,
                    DisplayOrder = displayOrder,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AnimalPhotos.Add(animalPhoto);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Animal photo uploaded successfully",
                    photo = new
                    {
                        id = animalPhoto.Id,
                        imageUrl = $"/api/images/animal-photo/{animalPhoto.Id}",
                        caption = animalPhoto.Caption,
                        isPrimary = animalPhoto.IsPrimary,
                        displayOrder = animalPhoto.DisplayOrder,
                        createdAt = animalPhoto.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading animal photo");
                return StatusCode(500, new { message = "An error occurred while uploading the photo", error = ex.Message });
            }
        }

        [HttpGet("animal-photo/{photoId}")]
        public async Task<ActionResult> GetAnimalPhoto(Guid photoId)
        {
            try
            {
                var photo = await _context.AnimalPhotos.FindAsync(photoId);
                if (photo == null || photo.PhotoData == null)
                {
                    return NotFound();
                }

                return File(photo.PhotoData, photo.ContentType ?? "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving animal photo {PhotoId}", photoId);
                return StatusCode(500, new { message = "An error occurred while retrieving the photo" });
            }
        }
    }
}
