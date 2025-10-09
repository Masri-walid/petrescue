using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.Services;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService _imageService;
        private readonly PetRescueDbContext _context;

        public ImagesController(IImageService imageService, PetRescueDbContext context)
        {
            _imageService = imageService;
            _context = context;
        }

        // All temporary photo methods removed for simplification

        [HttpPost("animals/{animalId}/photos")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<List<AnimalPhotoDto>>> UploadAnimalPhotos(
            Guid animalId,
            IFormFileCollection files)
        {
            var animal = await _context.Animals.FindAsync(animalId);
            if (animal == null)
            {
                return NotFound("Animal not found");
            }

            // Check if user has permission to upload photos for this animal
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) || 
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            var uploadResults = await _imageService.UploadMultipleImagesAsync(files, "animals");
            var photoResults = new List<AnimalPhotoDto>();

            foreach (var result in uploadResults.Where(r => r.Success))
            {
                var animalPhoto = new AnimalPhoto
                {
                    AnimalId = animalId,
                    PhotoUrl = result.Url, // Use the URL instead of file path
                    Caption = null, // Can be set later
                    IsPrimary = false,
                    DisplayOrder = 0, // Can be set later
                    CreatedAt = DateTime.UtcNow
                };

                _context.AnimalPhotos.Add(animalPhoto);
                await _context.SaveChangesAsync();

                photoResults.Add(new AnimalPhotoDto
                {
                    Id = animalPhoto.Id,
                    PhotoUrl = animalPhoto.PhotoUrl,
                    Caption = animalPhoto.Caption,
                    IsPrimary = animalPhoto.IsPrimary,
                    DisplayOrder = animalPhoto.DisplayOrder
                });
            }

            return Ok(photoResults);
        }

        // Temporary photo methods removed for simplification



        [HttpPut("animals/{animalId}/photos/{photoId}/primary")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> SetPrimaryPhoto(Guid animalId, Guid photoId)
        {
            var animal = await _context.Animals.FindAsync(animalId);
            if (animal == null)
            {
                return NotFound("Animal not found");
            }

            // Check if user has permission
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) || 
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            // Remove primary flag from all photos for this animal
            var allPhotos = await _context.AnimalPhotos
                .Where(p => p.AnimalId == animalId)
                .ToListAsync();

            foreach (var photo in allPhotos)
            {
                photo.IsPrimary = photo.Id == photoId;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("animals/photos/{photoId}")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> DeleteAnimalPhoto(Guid photoId)
        {
            var photo = await _context.AnimalPhotos
                .Include(p => p.Animal)
                .FirstOrDefaultAsync(p => p.Id == photoId);

            if (photo == null)
            {
                return NotFound();
            }

            // Check if user has permission
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) || 
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                photo.Animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            var deleted = await _imageService.DeleteImageAsync(photo.PhotoUrl);
            
            if (deleted)
            {
                _context.AnimalPhotos.Remove(photo);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        // Cleanup method removed - no longer needed
    }
}
