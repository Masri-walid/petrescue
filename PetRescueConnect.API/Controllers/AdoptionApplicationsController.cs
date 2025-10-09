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
    public class AdoptionApplicationsController : ControllerBase
    {
        private readonly PetRescueDbContext _context;

        public AdoptionApplicationsController(PetRescueDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<IEnumerable<AdoptionApplicationDto>>> GetApplications(
            [FromQuery] string? status = null,
            [FromQuery] Guid? animalId = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] string sortBy = "date",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.AdoptionApplications
                .Include(a => a.Animal)
                .Include(a => a.Applicant)
                .AsQueryable();

            // Filter by organization if user is from a shelter
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (!string.IsNullOrEmpty(organizationIdClaim) && Guid.TryParse(organizationIdClaim, out Guid userOrgId))
            {
                query = query.Where(a => a.Animal.OrganizationId == userOrgId);
            }

            // Apply additional filters
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            if (animalId.HasValue)
            {
                query = query.Where(a => a.AnimalId == animalId.Value);
            }

            if (organizationId.HasValue)
            {
                query = query.Where(a => a.Animal.OrganizationId == organizationId.Value);
            }

            // Apply sorting
            query = sortBy.ToLower() switch
            {
                "date" => query.OrderByDescending(a => a.CreatedAt),
                "score" => query.OrderByDescending(a => a.Score),
                "name" => query.OrderBy(a => a.FirstName).ThenBy(a => a.LastName),
                _ => query.OrderByDescending(a => a.CreatedAt)
            };

            // Apply pagination
            var totalCount = await query.CountAsync();
            var applications = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = applications.Select(a => new AdoptionApplicationDto
            {
                Id = a.Id,
                AnimalId = a.AnimalId,
                AnimalName = a.Animal.Name,
                ApplicantId = a.ApplicantId,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email,
                Phone = a.Phone,
                Address = a.Address,
                City = a.City,
                State = a.State,
                ZipCode = a.ZipCode,
                HousingType = a.HousingType,
                OwnRent = a.OwnRent,
                LandlordPermission = a.LandlordPermission,
                YardType = a.YardType,
                Fenced = a.Fenced,
                PetExperience = a.PetExperience,
                CurrentPets = a.CurrentPets,
                Veterinarian = a.Veterinarian,
                HoursAlone = a.HoursAlone,
                ExerciseTime = a.ExerciseTime,
                Reference1Name = a.Reference1Name,
                Reference1Phone = a.Reference1Phone,
                Reference2Name = a.Reference2Name,
                Reference2Phone = a.Reference2Phone,
                WhyAdopt = a.WhyAdopt,
                Expectations = a.Expectations,
                AgreeTerms = a.AgreeTerms,
                AgreeVisit = a.AgreeVisit,
                AgreeContact = a.AgreeContact,
                Status = a.Status,
                Score = a.Score,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt
            });

            return Ok(new
            {
                applications = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AdoptionApplicationDto>> GetApplication(Guid id)
        {
            var application = await _context.AdoptionApplications
                .Include(a => a.Animal)
                .Include(a => a.Applicant)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                return NotFound();
            }

            // Check permissions
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;

            bool hasPermission = false;

            if (userRole == "Citizen" && !string.IsNullOrEmpty(userIdClaim) &&
                Guid.TryParse(userIdClaim, out Guid userId) && application.ApplicantId == userId)
            {
                hasPermission = true;
            }
            else if ((userRole == "Shelter" || userRole == "Veterinarian") && 
                     !string.IsNullOrEmpty(organizationIdClaim) && 
                     Guid.TryParse(organizationIdClaim, out Guid orgId) &&
                     application.Animal.OrganizationId == orgId)
            {
                hasPermission = true;
            }

            if (!hasPermission)
            {
                return Forbid();
            }

            var result = new AdoptionApplicationDto
            {
                Id = application.Id,
                AnimalId = application.AnimalId,
                AnimalName = application.Animal.Name,
                ApplicantId = application.ApplicantId,
                FirstName = application.FirstName,
                LastName = application.LastName,
                Email = application.Email,
                Phone = application.Phone,
                Address = application.Address,
                City = application.City,
                State = application.State,
                ZipCode = application.ZipCode,
                HousingType = application.HousingType,
                OwnRent = application.OwnRent,
                LandlordPermission = application.LandlordPermission,
                YardType = application.YardType,
                Fenced = application.Fenced,
                PetExperience = application.PetExperience,
                CurrentPets = application.CurrentPets,
                Veterinarian = application.Veterinarian,
                HoursAlone = application.HoursAlone,
                ExerciseTime = application.ExerciseTime,
                Reference1Name = application.Reference1Name,
                Reference1Phone = application.Reference1Phone,
                Reference2Name = application.Reference2Name,
                Reference2Phone = application.Reference2Phone,
                WhyAdopt = application.WhyAdopt,
                Expectations = application.Expectations,
                AgreeTerms = application.AgreeTerms,
                AgreeVisit = application.AgreeVisit,
                AgreeContact = application.AgreeContact,
                Status = application.Status,
                Score = application.Score,
                Notes = application.Notes,
                CreatedAt = application.CreatedAt
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Citizen")]
        public async Task<ActionResult<AdoptionApplicationDto>> CreateApplication([FromBody] CreateAdoptionApplicationRequest request)
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

            // Check if animal exists and is available
            var animal = await _context.Animals.FindAsync(request.AnimalId);
            if (animal == null || animal.Status != "Available")
            {
                return BadRequest("Animal is not available for adoption");
            }

            // Check if user already has a pending application for this animal
            var existingApplication = await _context.AdoptionApplications
                .FirstOrDefaultAsync(a => a.AnimalId == request.AnimalId && a.ApplicantId == userId && 
                                         (a.Status == "Pending" || a.Status == "Approved"));

            if (existingApplication != null)
            {
                return BadRequest("You already have a pending or approved application for this animal");
            }

            var application = new AdoptionApplication
            {
                AnimalId = request.AnimalId,
                ApplicantId = userId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                HousingType = request.HousingType,
                OwnRent = request.OwnRent,
                LandlordPermission = request.LandlordPermission,
                YardType = request.YardType,
                Fenced = request.Fenced,
                PetExperience = request.PetExperience,
                CurrentPets = request.CurrentPets,
                Veterinarian = request.Veterinarian,
                HoursAlone = request.HoursAlone,
                ExerciseTime = request.ExerciseTime,
                Reference1Name = request.Reference1Name,
                Reference1Phone = request.Reference1Phone,
                Reference2Name = request.Reference2Name,
                Reference2Phone = request.Reference2Phone,
                WhyAdopt = request.WhyAdopt,
                Expectations = request.Expectations,
                AgreeTerms = request.AgreeTerms,
                AgreeVisit = request.AgreeVisit,
                AgreeContact = request.AgreeContact,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AdoptionApplications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application.Id);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid id, [FromBody] UpdateApplicationStatusRequest request)
        {
            var application = await _context.AdoptionApplications
                .Include(a => a.Animal)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
            {
                return NotFound();
            }

            // Check if user has permission to update this application
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) || 
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                application.Animal.OrganizationId != organizationId)
            {
                return Forbid();
            }

            application.Status = request.Status;
            application.Score = request.Score;
            application.Notes = request.Notes;
            application.UpdatedAt = DateTime.UtcNow;

            // If approved, mark animal as adopted
            if (request.Status == "Approved")
            {
                application.Animal.Status = "Adopted";
                
                // Reject other pending applications for this animal
                var otherApplications = await _context.AdoptionApplications
                    .Where(a => a.AnimalId == application.AnimalId && a.Id != id && a.Status == "Pending")
                    .ToListAsync();

                foreach (var otherApp in otherApplications)
                {
                    otherApp.Status = "Rejected";
                    otherApp.Notes = "Animal was adopted by another applicant";
                    otherApp.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
