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
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMapper _mapper;

        public OrganizationsController(IOrganizationRepository organizationRepository, IMapper mapper)
        {
            _organizationRepository = organizationRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetOrganizations(
            [FromQuery] string? organizationType = null,
            [FromQuery] bool? featured = null,
            [FromQuery] bool? verified = null,
            [FromQuery] string? search = null)
        {
            try
            {
                IEnumerable<Organization> organizations;

                // Start with all organizations
                organizations = await _organizationRepository.GetAllAsync();

                // Apply filters
                if (featured == true)
                {
                    organizations = organizations.Where(o => o.IsFeatured);
                }

                if (verified == true)
                {
                    organizations = organizations.Where(o => o.IsVerified);
                }

                if (!string.IsNullOrEmpty(organizationType))
                {
                    organizations = organizations.Where(o => o.OrganizationType == organizationType);
                }

                if (!string.IsNullOrEmpty(search))
                {
                    var searchLower = search.ToLower();
                    organizations = organizations.Where(o =>
                        o.Name.ToLower().Contains(searchLower) ||
                        o.City.ToLower().Contains(searchLower) ||
                        o.State.ToLower().Contains(searchLower) ||
                        (o.Description != null && o.Description.ToLower().Contains(searchLower)));
                }

                var organizationDtos = _mapper.Map<IEnumerable<OrganizationDto>>(organizations);
                return Ok(organizationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrganizationDto>> GetOrganization(Guid id)
        {
            try
            {
                var organization = await _organizationRepository.GetOrganizationWithDetailsAsync(id);
                if (organization == null)
                {
                    return NotFound(new { message = "Organization not found" });
                }

                var organizationDto = _mapper.Map<OrganizationDto>(organization);
                return Ok(organizationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<OrganizationDto>> CreateOrganization([FromBody] CreateOrganizationDto createOrganizationDto)
        {
            try
            {
                var organization = _mapper.Map<Organization>(createOrganizationDto);
                organization.CreatedAt = DateTime.UtcNow;
                organization.UpdatedAt = DateTime.UtcNow;

                var createdOrganization = await _organizationRepository.AddAsync(organization);
                var organizationDto = _mapper.Map<OrganizationDto>(createdOrganization);
                return CreatedAtAction(nameof(GetOrganization), new { id = organizationDto.Id }, organizationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<OrganizationDto>> RegisterOrganization([FromBody] CreateOrganizationDto createOrganizationDto)
        {
            try
            {
                var organization = _mapper.Map<Organization>(createOrganizationDto);
                organization.CreatedAt = DateTime.UtcNow;
                organization.UpdatedAt = DateTime.UtcNow;
                organization.IsVerified = false; // New organizations need verification
                organization.IsActive = true;

                var createdOrganization = await _organizationRepository.AddAsync(organization);
                var organizationDto = _mapper.Map<OrganizationDto>(createdOrganization);

                return Ok(new {
                    success = true,
                    message = "Organization registered successfully. It will be reviewed and verified by our team.",
                    data = organizationDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while registering the organization", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<OrganizationDto>> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationDto updateOrganizationDto)
        {
            try
            {
                var organization = await _organizationRepository.GetByIdAsync(id);
                if (organization == null)
                {
                    return NotFound(new { message = "Organization not found" });
                }

                _mapper.Map(updateOrganizationDto, organization);
                organization.UpdatedAt = DateTime.UtcNow;

                var updatedOrganization = await _organizationRepository.UpdateAsync(organization);
                var organizationDto = _mapper.Map<OrganizationDto>(updatedOrganization);
                return Ok(organizationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteOrganization(Guid id)
        {
            try
            {
                var organization = await _organizationRepository.GetByIdAsync(id);
                if (organization == null)
                {
                    return NotFound(new { message = "Organization not found" });
                }

                await _organizationRepository.DeleteAsync(organization);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
