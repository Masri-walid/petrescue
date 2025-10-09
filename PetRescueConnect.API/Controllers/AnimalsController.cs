using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalsController : ControllerBase
    {
        private readonly PetRescueDbContext _context;

        public AnimalsController(PetRescueDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnimalDto>>> GetAnimals(
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] string? age = null,
            [FromQuery] string? size = null,
            [FromQuery] string? status = "Available",
            [FromQuery] bool? featured = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] string sortBy = "name",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Animals
                .Include(a => a.Organization)
                .Include(a => a.Photos)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => 
                    a.Name.Contains(search) ||
                    (a.Breed != null && a.Breed.Contains(search)) ||
                    (a.Description != null && a.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(type) && type != "All Types")
            {
                query = query.Where(a => a.Type == type);
            }

            if (!string.IsNullOrEmpty(age) && age != "All Ages")
            {
                query = query.Where(a => a.Age != null && a.Age.Contains(age));
            }

            if (!string.IsNullOrEmpty(size) && size != "All Sizes")
            {
                query = query.Where(a => a.Size == size);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            if (featured.HasValue)
            {
                query = query.Where(a => a.Featured == featured.Value);
            }

            if (organizationId.HasValue)
            {
                query = query.Where(a => a.OrganizationId == organizationId.Value);
            }

            // Apply sorting
            query = sortBy.ToLower() switch
            {
                "name" => query.OrderBy(a => a.Name),
                "age" => query.OrderBy(a => a.Age),
                "date" => query.OrderByDescending(a => a.CreatedAt),
                "fee" => query.OrderBy(a => a.AdoptionFee),
                _ => query.OrderBy(a => a.Name)
            };

            // Apply pagination
            var totalCount = await query.CountAsync();
            var animals = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = animals.Select(a => new AnimalDto
            {
                Id = a.Id,
                Name = a.Name,
                Type = a.Type,
                Breed = a.Breed,
                Age = a.Age,
                Gender = a.Gender,
                Size = a.Size,
                Weight = a.Weight?.ToString(),
                Description = a.Description,
                Vaccinated = a.Vaccinated,
                SpayedNeutered = a.SpayedNeutered,
                Microchipped = a.Microchipped,
                GoodWithKids = a.GoodWithKids,
                GoodWithPets = a.GoodWithPets,
                GoodWithCats = a.GoodWithCats,
                EnergyLevel = a.EnergyLevel,
                AdoptionFee = a.AdoptionFee,
                Featured = a.Featured,
                RescueDate = a.RescueDate,
                HealthStatus = a.HealthStatus,
                SpecialNeeds = a.SpecialNeeds,
                HouseTrained = a.HouseTrained,
                Personality = System.Text.Json.JsonSerializer.Deserialize<string[]>(a.Personality) ?? Array.Empty<string>(),
                Status = a.Status,
                OrganizationId = a.OrganizationId,
                OrganizationName = a.Organization.Name,
                Photos = a.Photos.Select(p => new AnimalPhotoDto
                {
                    Id = p.Id,
                    PhotoUrl = p.PhotoUrl,
                    Caption = p.Caption,
                    IsPrimary = p.IsPrimary,
                    DisplayOrder = p.DisplayOrder
                }).ToList()
            });

            return Ok(new
            {
                animals = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AnimalDto>> GetAnimal(Guid id)
        {
            var animal = await _context.Animals
                .Include(a => a.Organization)
                .Include(a => a.Photos)
                .Include(a => a.MedicalRecords)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (animal == null)
            {
                return NotFound();
            }

            var result = new AnimalDto
            {
                Id = animal.Id,
                Name = animal.Name,
                Type = animal.Type,
                Breed = animal.Breed,
                Age = animal.Age,
                Gender = animal.Gender,
                Size = animal.Size,
                Weight = animal.Weight?.ToString(),
                Description = animal.Description,
                Vaccinated = animal.Vaccinated,
                SpayedNeutered = animal.SpayedNeutered,
                Microchipped = animal.Microchipped,
                GoodWithKids = animal.GoodWithKids,
                GoodWithPets = animal.GoodWithPets,
                GoodWithCats = animal.GoodWithCats,
                EnergyLevel = animal.EnergyLevel,
                AdoptionFee = animal.AdoptionFee,
                Featured = animal.Featured,
                RescueDate = animal.RescueDate,
                HealthStatus = animal.HealthStatus,
                SpecialNeeds = animal.SpecialNeeds,
                HouseTrained = animal.HouseTrained,
                Personality = System.Text.Json.JsonSerializer.Deserialize<string[]>(animal.Personality) ?? Array.Empty<string>(),
                Status = animal.Status,
                OrganizationId = animal.OrganizationId,
                OrganizationName = animal.Organization.Name,
                Photos = animal.Photos.Select(p => new AnimalPhotoDto
                {
                    Id = p.Id,
                    PhotoUrl = p.PhotoUrl,
                    Caption = p.Caption,
                    IsPrimary = p.IsPrimary,
                    DisplayOrder = p.DisplayOrder
                }).ToList(),
                MedicalRecords = animal.MedicalRecords.Select(m => new MedicalRecordDto
                {
                    Id = m.Id,
                    Type = m.Type,
                    Title = m.Title,
                    Description = m.Description,
                    VeterinarianName = m.VeterinarianName,
                    Clinic = m.Clinic,
                    Date = m.Date,
                    NextDue = m.NextDue,
                    Notes = m.Notes
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<AnimalDto>> CreateAnimal([FromBody] CreateAnimalRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(organizationIdClaim) ||
                !Guid.TryParse(organizationIdClaim, out Guid organizationId))
            {
                return Unauthorized();
            }

            var animal = new Animal
            {
                Name = request.Name,
                Species = request.Type, // Map Type to Species
                Breed = request.Breed,
                AgeCategory = request.AgeCategory,
                EstimatedAge = request.EstimatedAge,
                Gender = request.Gender,
                Size = request.Size,
                Color = request.Color,
                Weight = request.Weight,
                Description = request.Description,
                Vaccinated = request.Vaccinated,
                SpayedNeutered = request.SpayedNeutered,
                Microchipped = request.Microchipped,
                GoodWithKids = request.GoodWithKids,
                GoodWithPets = request.GoodWithPets,
                GoodWithCats = request.GoodWithCats,
                EnergyLevel = request.EnergyLevel,
                AdoptionFee = request.AdoptionFee,
                IsFeatured = request.Featured,
                RescueDate = request.RescueDate,
                HealthStatus = request.HealthStatus,
                SpecialNeeds = request.SpecialNeeds,
                HouseTrained = request.HouseTrained,
                Personality = System.Text.Json.JsonSerializer.Serialize(request.Personality),
                Status = request.Status,
                OrganizationId = organizationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Animals.Add(animal);
            await _context.SaveChangesAsync();

            // Update organization animal count
            var organization = await _context.Organizations.FindAsync(organizationId);
            if (organization != null)
            {
                organization.CurrentAnimals = await _context.Animals
                    .CountAsync(a => a.OrganizationId == organizationId && a.Status != "Adopted");
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetAnimal), new { id = animal.Id }, animal.Id);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> UpdateAnimal(Guid id, [FromBody] UpdateAnimalRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var animal = await _context.Animals.FindAsync(id);
            if (animal == null)
            {
                return NotFound();
            }

            // Check if user has permission to update this animal
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) ||
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            // Update animal properties
            animal.Name = request.Name;
            animal.Type = request.Type;
            animal.Breed = request.Breed;
            animal.Age = request.Age;
            animal.Gender = request.Gender;
            animal.Size = request.Size;
            animal.Weight = request.Weight;
            animal.Description = request.Description;
            animal.Vaccinated = request.Vaccinated;
            animal.SpayedNeutered = request.SpayedNeutered;
            animal.Microchipped = request.Microchipped;
            animal.GoodWithKids = request.GoodWithKids;
            animal.GoodWithPets = request.GoodWithPets;
            animal.GoodWithCats = request.GoodWithCats;
            animal.EnergyLevel = request.EnergyLevel;
            animal.AdoptionFee = request.AdoptionFee;
            animal.Featured = request.Featured;
            animal.RescueDate = request.RescueDate;
            animal.HealthStatus = request.HealthStatus;
            animal.SpecialNeeds = request.SpecialNeeds;
            animal.HouseTrained = request.HouseTrained;
            animal.Personality = System.Text.Json.JsonSerializer.Serialize(request.Personality);
            animal.Status = request.Status;
            animal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> DeleteAnimal(Guid id)
        {
            var animal = await _context.Animals.FindAsync(id);
            if (animal == null)
            {
                return NotFound();
            }

            // Check if user has permission to delete this animal
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) ||
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            _context.Animals.Remove(animal);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
