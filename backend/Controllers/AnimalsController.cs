using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.Data;
using System.Security.Claims;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalsController : ControllerBase
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly IMapper _mapper;
        private readonly PetRescueDbContext _context;
        private readonly IUserRepository _userRepository;

        public AnimalsController(IAnimalRepository animalRepository, IMapper mapper, PetRescueDbContext context, IUserRepository userRepository)
        {
            _animalRepository = animalRepository;
            _mapper = mapper;
            _context = context;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAnimals(
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] string? age = null,
            [FromQuery] string? size = null,
            [FromQuery] string? species = null,
            [FromQuery] string? status = null,
            [FromQuery] bool? featured = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? sortBy = "name")
        {
            try
            {
                IEnumerable<Animal> animals;

                if (featured == true)
                {
                    animals = await _animalRepository.GetFeaturedAnimalsAsync();
                }
                else if (!string.IsNullOrEmpty(species))
                {
                    animals = await _animalRepository.GetAnimalsBySpeciesAsync(species);
                }
                else if (organizationId.HasValue)
                {
                    animals = await _animalRepository.GetAnimalsByOrganizationAsync(organizationId.Value);
                }
                else if (status == "available" || status == "Available")
                {
                    animals = await _animalRepository.GetAvailableAnimalsAsync();
                }
                else
                {
                    animals = await _animalRepository.GetAllAsync();
                }

                // Apply additional filters
                if (!string.IsNullOrEmpty(search))
                {
                    animals = animals.Where(a =>
                        (a.Name != null && a.Name.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                        (a.Breed != null && a.Breed.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                        (a.Description != null && a.Description.Contains(search, StringComparison.OrdinalIgnoreCase)));
                }

                if (!string.IsNullOrEmpty(type) && type != "All Types")
                {
                    animals = animals.Where(a => a.Species.Equals(type, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrEmpty(age) && age != "All Ages")
                {
                    animals = animals.Where(a => a.AgeCategory != null && a.AgeCategory.Equals(age, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrEmpty(size) && size != "All Sizes")
                {
                    animals = animals.Where(a => a.Size != null && a.Size.Equals(size, StringComparison.OrdinalIgnoreCase));
                }

                // Apply sorting
                animals = sortBy?.ToLower() switch
                {
                    "name" => animals.OrderBy(a => a.Name),
                    "age" => animals.OrderBy(a => a.EstimatedAge),
                    "createdat" => animals.OrderByDescending(a => a.CreatedAt),
                    _ => animals.OrderBy(a => a.Name)
                };

                // Apply pagination
                var totalCount = animals.Count();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedAnimals = animals.Skip((page - 1) * pageSize).Take(pageSize);

                var animalDtos = _mapper.Map<IEnumerable<AnimalDto>>(paginatedAnimals);

                return Ok(new {
                    animals = animalDtos,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = totalPages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AnimalDto>> GetAnimal(Guid id)
        {
            try
            {
                var animal = await _animalRepository.GetAnimalWithPhotosAsync(id);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                var animalDto = _mapper.Map<AnimalDto>(animal);
                return Ok(animalDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<AnimalDto>>> SearchAnimals([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrEmpty(searchTerm))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var animals = await _animalRepository.SearchAnimalsAsync(searchTerm);
                var animalDtos = _mapper.Map<IEnumerable<AnimalDto>>(animals);
                return Ok(animalDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<AnimalDto>> CreateAnimal([FromBody] CreateAnimalDto createAnimalDto)
        {
            try
            {
                // Get current user and their organization
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return BadRequest(new { message = "Invalid user ID" });
                }

                // Get user's organization for shelter and veterinarian users
                if (userRole == "veterinarian" || userRole == "shelter")
                {
                    var userWithOrgs = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                    var activeOrg = userWithOrgs?.UserOrganizations?.FirstOrDefault(uo => uo.IsActive);

                    if (activeOrg != null)
                    {
                        createAnimalDto.OrganizationId = activeOrg.OrganizationId;
                    }
                    else
                    {
                        return BadRequest(new { message = "User is not associated with any active organization" });
                    }
                }

                var animal = _mapper.Map<Animal>(createAnimalDto);
                animal.CreatedAt = DateTime.UtcNow;
                animal.UpdatedAt = DateTime.UtcNow;

                var createdAnimal = await _animalRepository.AddAsync(animal);
                var animalDto = _mapper.Map<AnimalDto>(createdAnimal);
                return CreatedAtAction(nameof(GetAnimal), new { id = animalDto.Id }, animalDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("with-photos")]
        [Authorize]
        public async Task<ActionResult<AnimalDto>> CreateAnimalWithPhotos([FromForm] IFormCollection formData)
        {
            try
            {
                // Get current user and their organization
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return BadRequest(new { message = "Invalid user ID" });
                }

                Guid? organizationId = null;

                // Get user's organization for shelter and veterinarian users
                if (userRole == "veterinarian" || userRole == "shelter")
                {
                    var userWithOrgs = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                    var activeOrg = userWithOrgs?.UserOrganizations?.FirstOrDefault(uo => uo.IsActive);

                    if (activeOrg != null)
                    {
                        organizationId = activeOrg.OrganizationId;
                    }
                    else
                    {
                        return BadRequest(new { message = "User is not associated with any active organization" });
                    }
                }

                // Extract animal data from form
                var createAnimalDto = new CreateAnimalDto
                {
                    Name = formData["name"].FirstOrDefault(),
                    Species = formData["species"].FirstOrDefault() ?? "",
                    Breed = formData["breed"].FirstOrDefault(),
                    AgeCategory = formData["ageCategory"].FirstOrDefault(),
                    EstimatedAge = int.TryParse(formData["estimatedAge"].FirstOrDefault(), out var age) ? age : null,
                    Gender = formData["gender"].FirstOrDefault(),
                    Size = formData["size"].FirstOrDefault(),
                    Color = formData["color"].FirstOrDefault(),
                    Weight = decimal.TryParse(formData["weight"].FirstOrDefault(), out var weight) ? weight : null,
                    Description = formData["description"].FirstOrDefault(),
                    AdoptionFee = decimal.TryParse(formData["adoptionFee"].FirstOrDefault(), out var fee) ? fee : null,
                    VaccinationStatus = formData["healthStatus"].FirstOrDefault(),
                    IsSpayedNeutered = bool.TryParse(formData["spayedNeutered"].FirstOrDefault(), out var spayed) ? spayed : null,
                    Status = "available",
                    OrganizationId = organizationId // Set the organization ID
                };

                // Create animal
                var animal = _mapper.Map<Animal>(createAnimalDto);
                animal.CreatedAt = DateTime.UtcNow;
                animal.UpdatedAt = DateTime.UtcNow;

                var createdAnimal = await _animalRepository.AddAsync(animal);

                // Handle photo uploads
                var photos = formData.Files.GetFiles("photos");
                if (photos.Any())
                {
                    foreach (var photo in photos)
                    {
                        if (photo.Length > 0)
                        {
                            // Convert photo to base64 for storage
                            using var memoryStream = new MemoryStream();
                            await photo.CopyToAsync(memoryStream);
                            var photoData = memoryStream.ToArray();
                            var base64Photo = Convert.ToBase64String(photoData);

                            var animalPhoto = new AnimalPhoto
                            {
                                AnimalId = createdAnimal.Id,
                                PhotoUrl = $"data:{photo.ContentType};base64,{base64Photo}",
                                Caption = photo.FileName,
                                IsPrimary = photos.ToList().IndexOf(photo) == 0,
                                DisplayOrder = photos.ToList().IndexOf(photo),
                                CreatedAt = DateTime.UtcNow
                            };

                            _context.AnimalPhotos.Add(animalPhoto);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                var animalDto = _mapper.Map<AnimalDto>(createdAnimal);
                return CreatedAtAction(nameof(GetAnimal), new { id = animalDto.Id }, animalDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<AnimalDto>> UpdateAnimal(Guid id, [FromBody] UpdateAnimalDto updateAnimalDto)
        {
            try
            {
                var animal = await _animalRepository.GetByIdAsync(id);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                _mapper.Map(updateAnimalDto, animal);
                animal.UpdatedAt = DateTime.UtcNow;

                var updatedAnimal = await _animalRepository.UpdateAsync(animal);
                var animalDto = _mapper.Map<AnimalDto>(updatedAnimal);
                return Ok(animalDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteAnimal(Guid id)
        {
            try
            {
                var animal = await _animalRepository.GetByIdAsync(id);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                await _animalRepository.DeleteAsync(animal);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
