using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdoptionApplicationsController : ControllerBase
    {
        private readonly IGenericRepository<AdoptionApplication> _applicationRepository;
        private readonly PetRescueDbContext _context;
        private readonly IMapper _mapper;

        public AdoptionApplicationsController(IGenericRepository<AdoptionApplication> applicationRepository, PetRescueDbContext context, IMapper mapper)
        {
            _applicationRepository = applicationRepository;
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdoptionApplicationDto>>> GetAdoptionApplications(
            [FromQuery] string? status = null,
            [FromQuery] Guid? animalId = null,
            [FromQuery] Guid? applicantId = null,
            [FromQuery] Guid? organizationId = null)
        {
            try
            {
                // Get all applications with related entities
                var query = _context.AdoptionApplications
                    .Include(a => a.Animal)
                    .Include(a => a.Applicant)
                    .Include(a => a.Organization)
                    .Include(a => a.Reviewer)
                    .AsQueryable();

                // Apply filters
                if (organizationId.HasValue)
                {
                    query = query.Where(a => a.OrganizationId == organizationId.Value);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(a => a.Status == status);
                }

                if (animalId.HasValue)
                {
                    query = query.Where(a => a.AnimalId == animalId.Value);
                }

                if (applicantId.HasValue)
                {
                    query = query.Where(a => a.ApplicantId == applicantId.Value);
                }

                var applications = await query.ToListAsync();

                // Debug logging
                Console.WriteLine($"Found {applications.Count()} applications");
                foreach (var app in applications)
                {
                    Console.WriteLine($"Application {app.Id}: Animal={app.Animal?.Name ?? "NULL"}, Applicant={app.Applicant?.Email ?? "NULL"}");
                }

                var applicationDtos = _mapper.Map<IEnumerable<AdoptionApplicationDto>>(applications);
                return Ok(applicationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdoptionApplicationDto>> GetAdoptionApplication(Guid id)
        {
            try
            {
                var application = await _context.AdoptionApplications
                    .Include(a => a.Animal)
                    .Include(a => a.Applicant)
                    .Include(a => a.Organization)
                    .Include(a => a.Reviewer)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (application == null)
                {
                    return NotFound(new { message = "Adoption application not found" });
                }

                var applicationDto = _mapper.Map<AdoptionApplicationDto>(application);
                return Ok(applicationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdoptionApplicationDto>> CreateAdoptionApplication([FromBody] CreateAdoptionApplicationDto createApplicationDto)
        {
            try
            {
                var application = _mapper.Map<AdoptionApplication>(createApplicationDto);
                application.CreatedAt = DateTime.UtcNow;
                application.UpdatedAt = DateTime.UtcNow;

                var createdApplication = await _applicationRepository.AddAsync(application);
                var applicationDto = _mapper.Map<AdoptionApplicationDto>(createdApplication);
                return CreatedAtAction(nameof(GetAdoptionApplication), new { id = applicationDto.Id }, applicationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdoptionApplicationDto>> UpdateAdoptionApplication(Guid id, [FromBody] UpdateAdoptionApplicationDto updateApplicationDto)
        {
            try
            {
                var application = await _applicationRepository.GetByIdAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Adoption application not found" });
                }

                _mapper.Map(updateApplicationDto, application);
                application.UpdatedAt = DateTime.UtcNow;

                var updatedApplication = await _applicationRepository.UpdateAsync(application);
                var applicationDto = _mapper.Map<AdoptionApplicationDto>(updatedApplication);
                return Ok(applicationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}/review")]
        public async Task<ActionResult<AdoptionApplicationDto>> ReviewAdoptionApplication(Guid id, [FromBody] ReviewAdoptionApplicationDto reviewDto)
        {
            try
            {
                var application = await _applicationRepository.GetByIdAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Adoption application not found" });
                }

                _mapper.Map(reviewDto, application);

                var updatedApplication = await _applicationRepository.UpdateAsync(application);
                var applicationDto = _mapper.Map<AdoptionApplicationDto>(updatedApplication);
                return Ok(applicationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdoptionApplication(Guid id)
        {
            try
            {
                var application = await _applicationRepository.GetByIdAsync(id);
                if (application == null)
                {
                    return NotFound(new { message = "Adoption application not found" });
                }

                await _applicationRepository.DeleteAsync(application);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
