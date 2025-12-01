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
                    var searchLower = search.ToLower();
                    animals = animals.Where(a =>
                        (a.Name != null && a.Name.ToLower().Contains(searchLower)) ||
                        (a.Species != null && a.Species.ToLower().Contains(searchLower)) ||
                        (a.Breed != null && a.Breed.ToLower().Contains(searchLower)) ||
                        (a.Color != null && a.Color.ToLower().Contains(searchLower)) ||
                        (a.Gender != null && a.Gender.ToLower().Contains(searchLower)) ||
                        (a.AgeCategory != null && a.AgeCategory.ToLower().Contains(searchLower)) ||
                        (a.Size != null && a.Size.ToLower().Contains(searchLower)) ||
                        (a.Description != null && a.Description.ToLower().Contains(searchLower)) ||
                        (a.SpecialNeeds != null && a.SpecialNeeds.ToLower().Contains(searchLower)) ||
                        (a.PersonalityTraits != null && a.PersonalityTraits.Any(pt => pt.ToLower().Contains(searchLower))) ||
                        (a.MedicalConditions != null && a.MedicalConditions.Any(mc => mc.ToLower().Contains(searchLower))) ||
                        (a.Organization != null && (
                            (a.Organization.Name != null && a.Organization.Name.ToLower().Contains(searchLower)) ||
                            (a.Organization.Address != null && a.Organization.Address.ToLower().Contains(searchLower)) ||
                            (a.Organization.City != null && a.Organization.City.ToLower().Contains(searchLower)) ||
                            (a.Organization.State != null && a.Organization.State.ToLower().Contains(searchLower)) ||
                            (a.Organization.ZipCode != null && a.Organization.ZipCode.ToLower().Contains(searchLower))
                        )));
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
                // Get current user
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                if (string.IsNullOrEmpty(currentUserId) || !Guid.TryParse(currentUserId, out var userGuid))
                {
                    return BadRequest(new { message = "Invalid user ID" });
                }

                // Only allow shelters and veterinarians to create animals
                if (userRole != "veterinarian" && userRole != "shelter")
                {
                    return Forbid("Only shelters and veterinarians can create animals");
                }

                // If the user is associated with an active organization, link the animal to it
                var userWithOrgs = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                var activeOrg = userWithOrgs?.UserOrganizations?.FirstOrDefault(uo => uo.IsActive);
                if (activeOrg != null)
                {
                    createAnimalDto.OrganizationId = activeOrg.OrganizationId;
                }

                var animal = _mapper.Map<Animal>(createAnimalDto);
                animal.CreatedAt = DateTime.UtcNow;
                animal.UpdatedAt = DateTime.UtcNow;

                var createdAnimal = await _animalRepository.AddAsync(animal);

                // Calculate adoption likelihood automatically
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(5);
                    var predictionData = new
                    {
                        id = createdAnimal.Id.ToString(),
                        species = createdAnimal.Species,
                        breed = createdAnimal.Breed,
                        estimated_age = createdAnimal.EstimatedAge,
                        estimatedAge = createdAnimal.EstimatedAge,
                        gender = createdAnimal.Gender,
                        color = createdAnimal.Color
                    };
                    var response = await httpClient.PostAsJsonAsync(
                        "http://localhost:5002/api/adoption-likelihood/predict",
                        predictionData
                    );
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadFromJsonAsync<PredictionResult>();
                        if (result != null)
                        {
                            createdAnimal.AdoptionLikelihood = (decimal)result.adoption_likelihood;
                            await _animalRepository.UpdateAsync(createdAnimal);
                        }
                    }
                }
                catch (Exception predEx)
                {
                    // Log but don't fail - prediction is optional
                    Console.WriteLine($"Adoption prediction failed (non-critical): {predEx.Message}");
                }

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

                // Only allow shelters and veterinarians to create animals
                if (userRole != "veterinarian" && userRole != "shelter")
                {
                    return Forbid("Only shelters and veterinarians can create animals");
                }

                Guid? organizationId = null;

                // If the user is associated with an active organization, link the animal to it
                var userWithOrgs = await _userRepository.GetUserWithOrganizationsAsync(userGuid);
                var activeOrg = userWithOrgs?.UserOrganizations?.FirstOrDefault(uo => uo.IsActive);
                if (activeOrg != null)
                {
                    organizationId = activeOrg.OrganizationId;
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

                // Calculate adoption likelihood automatically
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(5);
                    var predictionData = new
                    {
                        id = createdAnimal.Id.ToString(),
                        species = createdAnimal.Species,
                        breed = createdAnimal.Breed,
                        estimated_age = createdAnimal.EstimatedAge,
                        estimatedAge = createdAnimal.EstimatedAge,
                        gender = createdAnimal.Gender,
                        color = createdAnimal.Color
                    };
                    var response = await httpClient.PostAsJsonAsync(
                        "http://localhost:5002/api/adoption-likelihood/predict",
                        predictionData
                    );
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadFromJsonAsync<PredictionResult>();
                        if (result != null)
                        {
                            createdAnimal.AdoptionLikelihood = (decimal)result.adoption_likelihood;
                            await _animalRepository.UpdateAsync(createdAnimal);
                        }
                    }
                }
                catch (Exception predEx)
                {
                    // Log but don't fail - prediction is optional
                    Console.WriteLine($"Adoption prediction failed (non-critical): {predEx.Message}");
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

        [HttpPost("{id}/update-adoption-likelihood")]
        [Authorize]
        public async Task<ActionResult<AnimalDto>> UpdateAdoptionLikelihood(Guid id)
        {
            try
            {
                var animal = await _animalRepository.GetAnimalWithPhotosAsync(id);
                if (animal == null)
                {
                    return NotFound(new { message = "Animal not found" });
                }

                // Call the prediction service
                using var httpClient = new HttpClient();
                var animalData = new
                {
                    id = animal.Id.ToString(),
                    species = animal.Species,
                    breed = animal.Breed,
                    estimated_age = animal.EstimatedAge,
                    gender = animal.Gender,
                    size = animal.Size,
                    color = animal.Color,
                    is_spayed_neutered = animal.IsSpayedNeutered,
                    vaccination_status = animal.VaccinationStatus,
                    adoption_fee = animal.AdoptionFee
                };

                var response = await httpClient.PostAsJsonAsync(
                    "http://localhost:5002/api/adoption-likelihood/predict",
                    animalData
                );

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<PredictionResult>();
                    if (result != null)
                    {
                        animal.AdoptionLikelihood = (decimal)result.adoption_likelihood;
                        animal.UpdatedAt = DateTime.UtcNow;
                        await _animalRepository.UpdateAsync(animal);
                    }
                }

                var animalDto = _mapper.Map<AnimalDto>(animal);
                return Ok(animalDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("update-all-adoption-likelihood")]
        [Authorize]
        public async Task<ActionResult> UpdateAllAdoptionLikelihoods()
        {
            try
            {
                // Call the batch update endpoint in the prediction service
                using var httpClient = new HttpClient();
                var response = await httpClient.PostAsync(
                    "http://localhost:5002/api/adoption-likelihood/update-all",
                    null
                );

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<BatchUpdateResult>();
                    return Ok(new { message = $"Updated {result?.updated ?? 0} animals" });
                }

                return StatusCode(500, new { message = "Failed to update adoption likelihoods" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        // Helper classes for deserialization
        private class PredictionResult
        {
            public double adoption_likelihood { get; set; }
            public string? animal_id { get; set; }
        }

        private class BatchUpdateResult
        {
            public string? message { get; set; }
            public int updated { get; set; }
            public int total { get; set; }
        }
    }
}
