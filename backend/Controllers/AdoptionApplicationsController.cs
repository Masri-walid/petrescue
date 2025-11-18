using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        private readonly IMapper _mapper;

        public AdoptionApplicationsController(IGenericRepository<AdoptionApplication> applicationRepository, IMapper mapper)
        {
            _applicationRepository = applicationRepository;
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
                IEnumerable<AdoptionApplication> applications;

                if (!string.IsNullOrEmpty(status))
                {
                    applications = await _applicationRepository.FindAsync(a => a.Status == status);
                }
                else if (animalId.HasValue)
                {
                    applications = await _applicationRepository.FindAsync(a => a.AnimalId == animalId);
                }
                else if (applicantId.HasValue)
                {
                    applications = await _applicationRepository.FindAsync(a => a.ApplicantId == applicantId);
                }
                else if (organizationId.HasValue)
                {
                    applications = await _applicationRepository.FindAsync(a => a.OrganizationId == organizationId);
                }
                else
                {
                    applications = await _applicationRepository.GetAllAsync();
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
                var application = await _applicationRepository.GetByIdAsync(id);
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
