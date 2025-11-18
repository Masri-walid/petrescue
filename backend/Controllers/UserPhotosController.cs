using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Models;
using System.Security.Claims;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPhotosController : ControllerBase
    {
        private readonly PetRescueDbContext _context;
        private readonly IMapper _mapper;

        public UserPhotosController(PetRescueDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserPhotoDto>>> GetUserPhotos([FromQuery] Guid? userId = null)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var currentUserGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // If no userId specified, get current user's photos
                var targetUserId = userId ?? currentUserGuid;

                var photos = await _context.UserPhotos
                    .Where(p => p.UserId == targetUserId)
                    .OrderByDescending(p => p.IsPrimary)
                    .ThenByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var photoDtos = photos.Select(p => new UserPhotoDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    PhotoUrl = p.PhotoData != null ? $"/api/images/user-photo/{p.Id}" : p.PhotoUrl,
                    Caption = p.Caption,
                    IsPrimary = p.IsPrimary,
                    CreatedAt = p.CreatedAt
                });

                return Ok(photoDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserPhotoDto>> CreateUserPhoto([FromBody] CreateUserPhotoDto createDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Only allow shelters and vets to add photos
                if (userRole != "shelter" && userRole != "veterinarian")
                {
                    return Forbid("Only shelters and veterinarians can add photos");
                }

                var userPhoto = _mapper.Map<UserPhoto>(createDto);
                userPhoto.UserId = userGuid;

                // If this is set as primary, make sure no other photos are primary
                if (createDto.IsPrimary)
                {
                    var existingPrimary = await _context.UserPhotos
                        .Where(p => p.UserId == userGuid && p.IsPrimary)
                        .ToListAsync();
                    
                    foreach (var photo in existingPrimary)
                    {
                        photo.IsPrimary = false;
                    }
                }

                _context.UserPhotos.Add(userPhoto);
                await _context.SaveChangesAsync();

                var photoDto = _mapper.Map<UserPhotoDto>(userPhoto);
                return CreatedAtAction(nameof(GetUserPhotos), new { userId = userGuid }, photoDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserPhotoDto>> UpdateUserPhoto(Guid id, [FromBody] UpdateUserPhotoDto updateDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var userPhoto = await _context.UserPhotos
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userGuid);

                if (userPhoto == null)
                {
                    return NotFound(new { message = "Photo not found" });
                }

                // If setting as primary, make sure no other photos are primary
                if (updateDto.IsPrimary == true)
                {
                    var existingPrimary = await _context.UserPhotos
                        .Where(p => p.UserId == userGuid && p.IsPrimary && p.Id != id)
                        .ToListAsync();
                    
                    foreach (var photo in existingPrimary)
                    {
                        photo.IsPrimary = false;
                    }
                }

                _mapper.Map(updateDto, userPhoto);
                await _context.SaveChangesAsync();

                var photoDto = _mapper.Map<UserPhotoDto>(userPhoto);
                return Ok(photoDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUserPhoto(Guid id)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var userPhoto = await _context.UserPhotos
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userGuid);

                if (userPhoto == null)
                {
                    return NotFound(new { message = "Photo not found" });
                }

                _context.UserPhotos.Remove(userPhoto);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
