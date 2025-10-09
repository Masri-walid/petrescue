using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Services;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : ControllerBase
    {
        private readonly PetRescueDbContext _context;
        private readonly ILocationService _locationService;

        public OrganizationsController(PetRescueDbContext context, ILocationService locationService)
        {
            _context = context;
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetOrganizations(
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] double? latitude = null,
            [FromQuery] double? longitude = null,
            [FromQuery] int radius = 30,
            [FromQuery] string sortBy = "distance")
        {
            try
            {
                // Test basic database connection first
                var count = await _context.Organizations.CountAsync();

                // Get organizations without accessing Coordinates for now
                var organizations = await _context.Organizations
                    .Select(o => new {
                        o.Id,
                        o.Name,
                        o.OrganizationType,
                        o.Address,
                        o.City,
                        o.State,
                        o.ZipCode,
                        o.Phone,
                        o.Email,
                        o.Website,
                        o.Rating,
                        o.ReviewCount,
                        o.Capacity,
                        o.CurrentAnimalCount,
                        o.IsFeatured
                    })
                    .ToListAsync();

                var result = organizations.Select(o => new OrganizationDto
                {
                    Id = o.Id,
                    Name = o.Name ?? "Unknown",
                    Type = o.OrganizationType ?? "Unknown",
                    Address = o.Address ?? "",
                    City = o.City ?? "",
                    State = o.State ?? "",
                    ZipCode = o.ZipCode ?? "",
                    Phone = o.Phone,
                    Email = o.Email,
                    Website = o.Website,
                    Latitude = 0, // TODO: Fix POINT column access
                    Longitude = 0, // TODO: Fix POINT column access
                    Rating = o.Rating,
                    ReviewCount = o.ReviewCount,
                    Capacity = o.Capacity ?? 0,
                    CurrentAnimals = o.CurrentAnimalCount,
                    Specialties = Array.Empty<string>(),
                    Services = Array.Empty<string>(),
                    Hours = new Dictionary<string, string>(),
                    Featured = o.IsFeatured,
                    Distance = null
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrganizationDto>> GetOrganization(Guid id)
        {
            var organization = await _context.Organizations.FindAsync(id);

            if (organization == null)
            {
                return NotFound();
            }

            var result = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Type = organization.OrganizationType,
                Address = organization.Address,
                City = organization.City,
                State = organization.State,
                ZipCode = organization.ZipCode,
                Phone = organization.Phone,
                Email = organization.Email,
                Website = organization.Website,
                Latitude = organization.Coordinates?.Y != null ? (decimal)organization.Coordinates.Y : 0,
                Longitude = organization.Coordinates?.X != null ? (decimal)organization.Coordinates.X : 0,
                Rating = organization.Rating,
                ReviewCount = organization.ReviewCount,
                Capacity = organization.Capacity ?? 0,
                CurrentAnimals = organization.CurrentAnimalCount,
                Specialties = Array.Empty<string>(), // TODO: Add to database schema if needed
                Services = Array.Empty<string>(), // TODO: Add to database schema if needed
                Hours = new Dictionary<string, string>(), // TODO: Add to database schema if needed
                Featured = organization.IsFeatured
            };

            return Ok(result);
        }
    }
}
