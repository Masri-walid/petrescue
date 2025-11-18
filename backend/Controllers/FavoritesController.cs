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
    public class FavoritesController : ControllerBase
    {
        private readonly PetRescueDbContext _context;
        private readonly IMapper _mapper;

        public FavoritesController(PetRescueDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnimalDto>>> GetUserFavorites()
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var favorites = await _context.Favorites
                    .Where(f => f.UserId == userGuid)
                    .Include(f => f.Animal)
                        .ThenInclude(a => a.AnimalPhotos)
                    .Include(f => f.Animal)
                        .ThenInclude(a => a.Organization)
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();

                var animals = favorites.Select(f => f.Animal).ToList();
                var animalDtos = _mapper.Map<IEnumerable<AnimalDto>>(animals);

                return Ok(animalDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("{animalId}")]
        public async Task<ActionResult> AddToFavorites(Guid animalId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                // Check if animal exists
                var animal = await _context.Animals.FindAsync(animalId);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                // Check if already favorited
                var existingFavorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userGuid && f.AnimalId == animalId);

                if (existingFavorite != null)
                {
                    return Conflict(new { message = "Animal is already in favorites" });
                }

                var favorite = new Favorite
                {
                    UserId = userGuid,
                    AnimalId = animalId
                };

                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Animal added to favorites", isFavorited = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{animalId}")]
        public async Task<ActionResult> RemoveFromFavorites(Guid animalId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var favorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userGuid && f.AnimalId == animalId);

                if (favorite == null)
                {
                    return NotFound(new { message = "Favorite not found" });
                }

                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Animal removed from favorites", isFavorited = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("check/{animalId}")]
        public async Task<ActionResult<object>> CheckFavoriteStatus(Guid animalId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var isFavorited = await _context.Favorites
                    .AnyAsync(f => f.UserId == userGuid && f.AnimalId == animalId);

                return Ok(new { isFavorited });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
