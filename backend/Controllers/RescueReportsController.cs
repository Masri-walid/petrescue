using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

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
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public RescueReportsController(
            IGenericRepository<RescueReport> rescueReportRepository,
            IUserRepository userRepository,
            IMapper mapper,
            PetRescueDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _rescueReportRepository = rescueReportRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<object>> GetRescueReports(
            [FromQuery] string? status = null,
            [FromQuery] string? urgencyLevel = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] Guid? reporterId = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = "createdAt")
        {
            try
            {
                // Base query including related data needed by the dashboard
                var query = _context.RescueReports
                    .Include(r => r.RescueReportPhotos)
                    .Include(r => r.AssignedOrganization)
                    .Include(r => r.Reporter)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                if (!string.IsNullOrEmpty(urgencyLevel))
                {
                    query = query.Where(r => r.UrgencyLevel == urgencyLevel);
                }

                if (organizationId.HasValue)
                {
                    query = query.Where(r => r.AssignedOrganizationId == organizationId);
                }

                if (reporterId.HasValue)
                {
                    query = query.Where(r => r.ReporterId == reporterId);
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    var searchLower = search.ToLower();
                    query = query.Where(r =>
                        (r.AnimalType != null && r.AnimalType.ToLower().Contains(searchLower)) ||
                        (r.Description != null && r.Description.ToLower().Contains(searchLower)) ||
                        (r.LocationAddress != null && r.LocationAddress.ToLower().Contains(searchLower)) ||
                        (r.ContactName != null && r.ContactName.ToLower().Contains(searchLower)) ||
                        (r.AnimalCondition != null && r.AnimalCondition.ToLower().Contains(searchLower)));
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "createdat" => query.OrderByDescending(r => r.CreatedAt),
                    "urgency" => query.OrderByDescending(r => r.UrgencyLevel),
                    "status" => query.OrderBy(r => r.Status),
                    _ => query.OrderByDescending(r => r.CreatedAt)
                };

                // Pagination
                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var paginatedReports = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Map to DTOs and convert photo binaries to base64 so the frontend can display them
                var reportDtos = new List<RescueReportDto>();

                foreach (var report in paginatedReports)
                {
                    var dto = _mapper.Map<RescueReportDto>(report);

                    // Ensure we only attach photos that belong to this report (safety check)
                    if (report.RescueReportPhotos != null && report.RescueReportPhotos.Any())
                    {
                        var matchingPhotos = report.RescueReportPhotos
                            .Where(p => p.RescueReportId == report.Id)
                            .ToList();

                        dto.RescueReportPhotos = new List<RescueReportPhotoDto>();

                        foreach (var photo in matchingPhotos)
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

                            if (photo.PhotoData != null && photo.PhotoData.Length > 0)
                            {
                                photoDto.PhotoData = Convert.ToBase64String(photo.PhotoData);
                            }
                            else if (!string.IsNullOrEmpty(photo.PhotoUrl))
                            {
                                photoDto.PhotoData = null; // Will use PhotoUrl instead
                            }

                            dto.RescueReportPhotos.Add(photoDto);
                        }
                    }

                    // Ensure the assigned organization on the DTO matches the FK
                    if (report.AssignedOrganizationId.HasValue &&
                        report.AssignedOrganization != null &&
                        report.AssignedOrganization.Id == report.AssignedOrganizationId.Value)
                    {
                        dto.AssignedOrganization = _mapper.Map<OrganizationDto>(report.AssignedOrganization);
                    }
                    else
                    {
                        dto.AssignedOrganization = null;
                    }

                    reportDtos.Add(dto);
                }

                return Ok(new
                {
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
                    var matchingPhotos = report.RescueReportPhotos
                        .Where(p => p.RescueReportId == report.Id)
                        .ToList();

                    reportDto.RescueReportPhotos = new List<RescueReportPhotoDto>();

                    foreach (var photo in matchingPhotos)
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

                // Ensure the assigned organization on the DTO matches the FK
                if (report.AssignedOrganizationId.HasValue &&
                    report.AssignedOrganization != null &&
                    report.AssignedOrganization.Id == report.AssignedOrganizationId.Value)
                {
                    reportDto.AssignedOrganization = _mapper.Map<OrganizationDto>(report.AssignedOrganization);
                }
                else
                {
                    reportDto.AssignedOrganization = null;
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

                var newPhotos = new List<RescueReportPhoto>();

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
                            newPhotos.Add(rescueReportPhoto);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                if (newPhotos.Count > 0)
                {
                    await AnalyzeAndSavePhotoMetadataAsync(newPhotos);
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

        private class PhotoCharacteristicResult
        {
            public string Name { get; set; } = string.Empty;
            public string Value { get; set; } = string.Empty;
            public decimal? Confidence { get; set; }
        }

        private class PhotoAnalysisResult
        {
            public double[] Embedding { get; set; } = Array.Empty<double>();
            public List<PhotoCharacteristicResult>? Characteristics { get; set; }
        }

        private async Task AnalyzeAndSavePhotoMetadataAsync(IEnumerable<RescueReportPhoto> photos)
        {
            var mlServiceUrl = _configuration["MLService:Url"] ?? "http://localhost:5001";
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromMinutes(5);

            // Cache characteristics by name to avoid repeated lookups
            var characteristicCache = await _context.Characteristics
                .ToDictionaryAsync(c => c.Name, StringComparer.OrdinalIgnoreCase);

            foreach (var photo in photos)
            {
                if (photo.PhotoData == null || photo.PhotoData.Length == 0)
                {
                    continue;
                }

                using var content = new MultipartFormDataContent();
                var byteContent = new ByteArrayContent(photo.PhotoData);
                if (!string.IsNullOrEmpty(photo.ContentType))
                {
                    byteContent.Headers.ContentType = new MediaTypeHeaderValue(photo.ContentType);
                }

                content.Add(byteContent, "photo", photo.FileName ?? $"{photo.Id}.jpg");

                HttpResponseMessage response;
                try
                {
                    response = await httpClient.PostAsync($"{mlServiceUrl}/api/analyze-photo", content);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error calling ML analyze-photo endpoint: {ex.Message}");
                    continue;
                }

                if (!response.IsSuccessStatusCode)
                {
                    continue;
                }

                var json = await response.Content.ReadAsStringAsync();
                PhotoAnalysisResult? analysis;
                try
                {
                    analysis = JsonSerializer.Deserialize<PhotoAnalysisResult>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deserializing analyze-photo response: {ex.Message}");
                    continue;
                }

                if (analysis == null || analysis.Embedding == null || analysis.Embedding.Length == 0)
                {
                    continue;
                }

                // Upsert embedding for this photo
                var existingEmbedding = await _context.PhotoEmbeddings
                    .FirstOrDefaultAsync(e => e.PhotoId == photo.Id);

                if (existingEmbedding == null)
                {
                    existingEmbedding = new PhotoEmbedding
                    {
                        PhotoId = photo.Id,
                        Embedding = analysis.Embedding,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.PhotoEmbeddings.Add(existingEmbedding);
                }
                else
                {
                    existingEmbedding.Embedding = analysis.Embedding;
                    existingEmbedding.CreatedAt = DateTime.UtcNow;
                }

                if (analysis.Characteristics != null)
                {
                    foreach (var ch in analysis.Characteristics)
                    {
                        if (string.IsNullOrWhiteSpace(ch.Name) || string.IsNullOrWhiteSpace(ch.Value))
                        {
                            continue;
                        }

                        if (!characteristicCache.TryGetValue(ch.Name, out var characteristic))
                        {
                            characteristic = new Characteristic
                            {
                                Name = ch.Name,
                                DataType = "string",
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.Characteristics.Add(characteristic);
                            characteristicCache[ch.Name] = characteristic;
                        }

                        var existingPhotoChar = await _context.PhotoCharacteristics
                            .FirstOrDefaultAsync(pc => pc.PhotoId == photo.Id && pc.CharacteristicId == characteristic.Id);

                        if (existingPhotoChar == null)
                        {
                            var photoCharacteristic = new PhotoCharacteristic
                            {
                                PhotoId = photo.Id,
                                CharacteristicId = characteristic.Id,
                                Value = ch.Value,
                                Confidence = ch.Confidence,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.PhotoCharacteristics.Add(photoCharacteristic);
                        }
                        else
                        {
                            existingPhotoChar.Value = ch.Value;
                            existingPhotoChar.Confidence = ch.Confidence;
                        }
                    }
                }

                await _context.SaveChangesAsync();
            }
        }

    }
}
