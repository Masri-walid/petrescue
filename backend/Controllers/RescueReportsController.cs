using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RescueReportsController : ControllerBase
    {
        private readonly IGenericRepository<RescueReport> _rescueReportRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly PetRescueDbContext _context;

        public RescueReportsController(IGenericRepository<RescueReport> rescueReportRepository, IUserRepository userRepository, IMapper mapper, PetRescueDbContext context)
        {
            _rescueReportRepository = rescueReportRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<object>> GetRescueReports(
            [FromQuery] string? status = null,
            [FromQuery] string? urgencyLevel = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] Guid? reporterId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = "createdAt")
        {
            try
            {
                // Get user role from JWT token
                var userRole = User.FindFirst("user_type")?.Value;
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                IEnumerable<RescueReport> reports;

                // All authenticated users can see all reports
                // (Role-based permissions for actions like claiming/updating are handled elsewhere)
                reports = await _rescueReportRepository.GetAllAsync();

                // Apply additional filters
                if (!string.IsNullOrEmpty(status))
                {
                    reports = reports.Where(r => r.Status == status);
                }
                if (!string.IsNullOrEmpty(urgencyLevel))
                {
                    reports = reports.Where(r => r.UrgencyLevel == urgencyLevel);
                }
                if (organizationId.HasValue)
                {
                    reports = reports.Where(r => r.AssignedOrganizationId == organizationId);
                }
                if (reporterId.HasValue)
                {
                    reports = reports.Where(r => r.ReporterId == reporterId);
                }

                // Apply sorting
                reports = sortBy?.ToLower() switch
                {
                    "createdat" => reports.OrderByDescending(r => r.CreatedAt),
                    "urgency" => reports.OrderByDescending(r => r.UrgencyLevel),
                    "status" => reports.OrderBy(r => r.Status),
                    _ => reports.OrderByDescending(r => r.CreatedAt)
                };

                // Apply pagination
                var totalCount = reports.Count();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedReports = reports.Skip((page - 1) * pageSize).Take(pageSize);

                var reportDtos = _mapper.Map<IEnumerable<RescueReportDto>>(paginatedReports);

                return Ok(new {
                    reports = reportDtos,
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
        [Authorize]
        public async Task<ActionResult<RescueReportDto>> GetRescueReport(Guid id)
        {
            try
            {
                // Get report with photos using context directly
                var report = await _context.RescueReports
                    .Include(r => r.RescueReportPhotos)
                    .Include(r => r.AssignedOrganization)
                    .Include(r => r.Reporter)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (report == null)
                {
                    return NotFound(new { message = "Rescue report not found" });
                }

                var reportDto = _mapper.Map<RescueReportDto>(report);

                // Convert photo data to base64 for frontend display and ensure all photos are included
                if (report.RescueReportPhotos != null && report.RescueReportPhotos.Any())
                {
                    reportDto.RescueReportPhotos = new List<RescueReportPhotoDto>();

                    foreach (var photo in report.RescueReportPhotos)
                    {
                        var photoDto = new RescueReportPhotoDto
                        {
                            Id = photo.Id,
                            RescueReportId = photo.RescueReportId,
                            PhotoUrl = photo.PhotoUrl,
                            ContentType = photo.ContentType,
                            FileName = photo.FileName,
                            FileSize = photo.FileSize,
                            Caption = photo.Caption,
                            CreatedAt = photo.CreatedAt
                        };

                        // Convert binary data to base64 if available
                        if (photo.PhotoData != null && photo.PhotoData.Length > 0)
                        {
                            photoDto.PhotoData = Convert.ToBase64String(photo.PhotoData);
                        }
                        else if (!string.IsNullOrEmpty(photo.PhotoUrl))
                        {
                            photoDto.PhotoData = null; // Will use PhotoUrl instead
                        }

                        reportDto.RescueReportPhotos.Add(photoDto);
                    }
                }

                return Ok(reportDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateRescueReport([FromForm] CreateRescueReportDto createRescueReportDto, [FromForm] List<IFormFile>? photos = null)
        {
            try
            {
                var report = _mapper.Map<RescueReport>(createRescueReportDto);
                report.CreatedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;

                // Set default coordinates if not provided
                if (string.IsNullOrEmpty(report.Coordinates))
                {
                    report.Coordinates = "POINT(0 0)";
                }

                var createdReport = await _rescueReportRepository.AddAsync(report);

                // Process and save photos if provided
                if (photos != null && photos.Count > 0)
                {
                    foreach (var photo in photos)
                    {
                        if (photo.Length > 0)
                        {
                            using var memoryStream = new MemoryStream();
                            await photo.CopyToAsync(memoryStream);

                            var rescueReportPhoto = new RescueReportPhoto
                            {
                                RescueReportId = createdReport.Id,
                                PhotoData = memoryStream.ToArray(),
                                ContentType = photo.ContentType,
                                FileName = photo.FileName,
                                FileSize = photo.Length,
                                CreatedAt = DateTime.UtcNow
                            };

                            _context.RescueReportPhotos.Add(rescueReportPhoto);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                var reportDto = _mapper.Map<RescueReportDto>(createdReport);

                return Ok(new {
                    success = true,
                    message = "Rescue report created successfully",
                    data = reportDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("json")]
        public async Task<ActionResult<object>> CreateRescueReportJson([FromBody] CreateRescueReportDto createRescueReportDto)
        {
            try
            {
                var report = _mapper.Map<RescueReport>(createRescueReportDto);
                report.CreatedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;

                var createdReport = await _rescueReportRepository.AddAsync(report);
                var reportDto = _mapper.Map<RescueReportDto>(createdReport);

                return Ok(new {
                    success = true,
                    message = "Rescue report created successfully",
                    data = reportDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<RescueReportDto>> UpdateRescueReport(Guid id, [FromBody] UpdateRescueReportDto updateRescueReportDto)
        {
            try
            {
                var report = await _rescueReportRepository.GetByIdAsync(id);
                if (report == null)
                {
                    return NotFound(new { message = "Rescue report not found" });
                }

                _mapper.Map(updateRescueReportDto, report);
                report.UpdatedAt = DateTime.UtcNow;

                var updatedReport = await _rescueReportRepository.UpdateAsync(report);
                var reportDto = _mapper.Map<RescueReportDto>(updatedReport);
                return Ok(reportDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<ActionResult<object>> UpdateRescueReportStatus(Guid id, [FromBody] UpdateStatusDto updateStatusDto)
        {
            try
            {
                var report = await _rescueReportRepository.GetByIdAsync(id);
                if (report == null)
                {
                    return NotFound(new { message = "Rescue report not found" });
                }

                // Update status and timestamp
                report.Status = updateStatusDto.Status;
                report.UpdatedAt = DateTime.UtcNow;

                var updatedReport = await _rescueReportRepository.UpdateAsync(report);
                var reportDto = _mapper.Map<RescueReportDto>(updatedReport);

                return Ok(new {
                    success = true,
                    message = "Status updated successfully",
                    data = reportDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}/assign")]
        [Authorize]
        public async Task<ActionResult<object>> AssignRescueReport(Guid id, [FromBody] AssignReportDto assignDto)
        {
            try
            {
                var report = await _rescueReportRepository.GetByIdAsync(id);
                if (report == null)
                {
                    return NotFound(new { message = "Rescue report not found" });
                }

                // Get current user ID from JWT token
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst("user_type")?.Value;

                Guid organizationId;

                // If organizationId is provided and not empty/null GUID, use it
                if (assignDto.OrganizationId != Guid.Empty)
                {
                    organizationId = assignDto.OrganizationId;
                }
                else
                {
                    // Auto-assign based on user's organization (for vets/shelters)
                    if (userRole == "veterinarian" || userRole == "shelter")
                    {
                        if (Guid.TryParse(currentUserId, out var userGuid))
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
                        else
                        {
                            return BadRequest(new { message = "Invalid user ID" });
                        }
                    }
                    else
                    {
                        return Forbid("Only veterinarians and shelters can assign reports");
                    }
                }

                // Update assignment and status
                report.AssignedOrganizationId = organizationId;
                report.Status = "assigned";
                report.UpdatedAt = DateTime.UtcNow;

                var updatedReport = await _rescueReportRepository.UpdateAsync(report);
                var reportDto = _mapper.Map<RescueReportDto>(updatedReport);

                return Ok(new {
                    success = true,
                    message = "Report assigned successfully",
                    data = reportDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("unhandled/count")]
        [Authorize]
        public async Task<ActionResult<object>> GetUnhandledReportsCount()
        {
            try
            {
                // Get user role from JWT token
                var userRole = User.FindFirst("user_type")?.Value;

                if (userRole != "veterinarian" && userRole != "shelter")
                {
                    return Forbid("Only veterinarians and shelters can access this endpoint");
                }

                var unhandledReports = await _rescueReportRepository.FindAsync(r => r.Status == "pending");
                var count = unhandledReports.Count();

                return Ok(new { count = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RescueReportDto>>> GetUserRescueReports(Guid userId)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Users can only access their own reports unless they're vet/shelter
                var userRole = User.FindFirst("user_type")?.Value;
                if (currentUserId != userId.ToString() && userRole != "veterinarian" && userRole != "shelter")
                {
                    return Forbid("You can only access your own reports");
                }

                var reports = await _rescueReportRepository.FindAsync(r => r.ReporterId == userId);
                var reportDtos = _mapper.Map<IEnumerable<RescueReportDto>>(reports);

                return Ok(reportDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteRescueReport(Guid id)
        {
            try
            {
                var report = await _rescueReportRepository.GetByIdAsync(id);
                if (report == null)
                {
                    return NotFound(new { message = "Rescue report not found" });
                }

                await _rescueReportRepository.DeleteAsync(report);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
