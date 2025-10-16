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

        [HttpGet("debug/test")]
        public async Task<ActionResult> TestAnimalsQuery()
        {
            try
            {
                // Simple test query to check if basic animal access works
                var count = await _context.Animals.CountAsync();
                return Ok(new { message = "Success", animalCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("debug/simple")]
        public async Task<ActionResult> TestSimpleAnimalsQuery()
        {
            try
            {
                // Test simple query without includes
                var animals = await _context.Animals
                    .Take(5)
                    .Select(a => new {
                        Id = a.Id,
                        Name = a.Name,
                        Species = a.Species,
                        Status = a.Status
                    })
                    .ToListAsync();
                return Ok(new { message = "Success", animals = animals });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
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
                // Temporarily disable Photos include to isolate issue
                // .Include(a => a.Photos)
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
                query = query.Where(a => a.Species == type); // Fixed: Use Species instead of Type
            }

            // Temporarily disable age filter since Age property doesn't exist in database
            // if (!string.IsNullOrEmpty(age) && age != "All Ages")
            // {
            //     query = query.Where(a => a.Age != null && a.Age.Contains(age));
            // }

            if (!string.IsNullOrEmpty(size) && size != "All Sizes")
            {
                query = query.Where(a => a.Size == size);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            // Temporarily disable featured filter since Featured property is ignored
            // if (featured.HasValue)
            // {
            //     query = query.Where(a => a.Featured == featured.Value);
            // }

            if (organizationId.HasValue)
            {
                query = query.Where(a => a.OrganizationId == organizationId.Value);
            }

            // Apply sorting (using only properties that exist in database)
            query = sortBy.ToLower() switch
            {
                "name" => query.OrderBy(a => a.Name),
                "date" => query.OrderByDescending(a => a.CreatedAt),
                "species" => query.OrderBy(a => a.Species),
                "status" => query.OrderBy(a => a.Status),
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
                Vaccinated = false, // Not in database, default to false
                SpayedNeutered = a.IsSpayedNeutered ?? false, // Use IsSpayedNeutered from database
                Microchipped = false, // Not in database, default to false
                GoodWithKids = a.GoodWithKids,
                GoodWithPets = a.GoodWithPets,
                GoodWithCats = a.GoodWithCats,
                EnergyLevel = a.EnergyLevel,
                AdoptionFee = 0, // Not in database, default to 0
                Featured = false, // Not in database, default to false
                RescueDate = null, // Not in database, default to null
                HealthStatus = "Unknown", // Not in database, default to Unknown
                SpecialNeeds = false, // Not in database, default to false
                HouseTrained = a.HouseTrained,
                Personality = System.Text.Json.JsonSerializer.Deserialize<string[]>(a.Personality) ?? Array.Empty<string>(),
                Status = a.Status,
                OrganizationId = a.OrganizationId,
                OrganizationName = a.Organization?.Name ?? "Unknown",
                Photos = new List<AnimalPhotoDto>() // Temporarily empty since Photos include is disabled
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
                Vaccinated = false, // Not in database, default to false
                SpayedNeutered = animal.IsSpayedNeutered ?? false, // Use IsSpayedNeutered from database
                Microchipped = false, // Not in database, default to false
                GoodWithKids = animal.GoodWithKids,
                GoodWithPets = animal.GoodWithPets,
                GoodWithCats = animal.GoodWithCats,
                EnergyLevel = animal.EnergyLevel,
                AdoptionFee = 0, // Not in database, default to 0
                Featured = false, // Not in database, default to false
                RescueDate = null, // Not in database, default to null
                HealthStatus = "Unknown", // Not in database, default to Unknown
                SpecialNeeds = false, // Not in database, default to false
                HouseTrained = animal.HouseTrained,
                Personality = System.Text.Json.JsonSerializer.Deserialize<string[]>(animal.Personality) ?? Array.Empty<string>(),
                Status = animal.Status,
                OrganizationId = animal.OrganizationId,
                OrganizationName = animal.Organization.Name,
                Photos = animal.Photos.Select(p => new AnimalPhotoDto
                {
                    Id = p.Id,
                    PhotoUrl = p.FilePath ?? "", // Use FilePath instead of PhotoUrl
                    Caption = p.FileName ?? "", // Use FileName as Caption
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
        [Authorize(Roles = "shelter,veterinarian")]
        public async Task<ActionResult<AnimalDto>> CreateAnimal([FromBody] CreateAnimalRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            // For now, use user ID as organization ID (simulating each user is their own organization)
            // In production, this should be properly linked to user's organization
            var organizationId = userId;

            var animal = new Animal
            {
                Name = request.Name,
                Species = request.Type, // Map Type to Species
                Breed = request.Breed,
                Gender = request.Gender,
                Size = request.Size,
                Color = request.Color,
                Weight = request.Weight,
                Description = request.Description,
                // Only set properties that are mapped to database columns
                GoodWithKids = request.GoodWithKids,
                GoodWithPets = request.GoodWithPets,
                EnergyLevel = request.EnergyLevel,
                HouseTrained = request.HouseTrained,
                IsSpayedNeutered = request.SpayedNeutered, // Map to the correct property name
                Status = request.Status ?? "Available",
                OrganizationId = organizationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
                // Ignored properties: Personality, Vaccinated, SpayedNeutered, Microchipped,
                // GoodWithCats, AgeCategory, EstimatedAge, AdoptionFee, IsFeatured,
                // RescueDate, HealthStatus, SpecialNeeds
            };

            _context.Animals.Add(animal);
            await _context.SaveChangesAsync();

            // Update organization animal count
            var organization = await _context.Organizations.FindAsync(organizationId);
            if (organization != null)
            {
                organization.CurrentAnimals = await _context.Animals
                    .CountAsync(a => a.OrganizationId == organizationId); // Temporarily removed status filter
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetAnimal), new { id = animal.Id }, animal.Id);
        }

        [HttpPost("with-photos")]
        [Authorize(Roles = "shelter,veterinarian")]
        public async Task<ActionResult<AnimalDto>> CreateAnimalWithPhotos([FromForm] CreateAnimalRequest request, [FromForm] List<IFormFile>? photos)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            // For now, use user ID as organization ID (simulating each user is their own organization)
            // In production, this should be properly linked to user's organization
            var organizationId = userId;

            var animal = new Animal
            {
                Name = request.Name,
                Species = request.Type, // Map Type to Species
                Breed = request.Breed,
                Gender = request.Gender,
                Size = request.Size,
                Color = request.Color,
                Weight = request.Weight,
                Description = request.Description,
                // Only set properties that are mapped to database columns
                GoodWithKids = request.GoodWithKids,
                GoodWithPets = request.GoodWithPets,
                EnergyLevel = request.EnergyLevel,
                HouseTrained = request.HouseTrained,
                IsSpayedNeutered = request.SpayedNeutered, // Map to the correct property name
                Status = request.Status ?? "Available",
                OrganizationId = organizationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
                // Ignored properties: Personality, Vaccinated, SpayedNeutered, Microchipped,
                // GoodWithCats, AgeCategory, EstimatedAge, AdoptionFee, IsFeatured,
                // RescueDate, HealthStatus, SpecialNeeds
            };

            _context.Animals.Add(animal);
            await _context.SaveChangesAsync();

            // Process photo uploads
            if (photos != null && photos.Count > 0)
            {
                await ProcessAnimalPhotoUploads(animal.Id, photos);
            }

            // Update organization animal count
            var organization = await _context.Organizations.FindAsync(organizationId);
            if (organization != null)
            {
                organization.CurrentAnimals = await _context.Animals
                    .CountAsync(a => a.OrganizationId == organizationId); // Temporarily removed status filter
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetAnimal), new { id = animal.Id }, animal.Id);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "shelter,veterinarian")]
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            // For now, use user ID as organization ID (simulating each user is their own organization)
            var organizationId = userId;
            if (animal.OrganizationId != organizationId)
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
            animal.Status = request.Status ?? "Available";
            animal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "shelter,veterinarian")]
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

        private async Task ProcessAnimalPhotoUploads(Guid animalId, List<IFormFile> photos)
        {
            try
            {
                // Create directory for animal photos
                var uploadPath = Path.Combine("wwwroot", "uploads", "animals", animalId.ToString());
                Directory.CreateDirectory(uploadPath);

                for (int i = 0; i < photos.Count && i < 5; i++) // Limit to 5 photos
                {
                    var photo = photos[i];

                    if (photo.Length > 0)
                    {
                        // Generate unique filename
                        var fileExtension = Path.GetExtension(photo.FileName) ?? ".jpg";
                        var fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var filePath = Path.Combine(uploadPath, fileName);

                        // Save file to disk
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await photo.CopyToAsync(stream);
                        }

                        // Store file path in database
                        var animalPhoto = new AnimalPhoto
                        {
                            Id = Guid.NewGuid(),
                            AnimalId = animalId,
                            FilePath = $"/uploads/animals/{animalId}/{fileName}",
                            FileName = photo.FileName ?? $"animal-photo-{i + 1}.jpg",
                            ContentType = photo.ContentType ?? "image/jpeg",
                            FileSize = photo.Length,
                            IsPrimary = i == 0, // First photo is primary
                            DisplayOrder = i + 1,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.AnimalPhotos.Add(animalPhoto);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the animal creation
                Console.WriteLine($"Error processing animal photos: {ex.Message}");
            }
        }
    }
}
