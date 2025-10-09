using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Services;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RescueReportsController : ControllerBase
    {
        private readonly PetRescueDbContext _context;
        private readonly ILocationService _locationService;
        private readonly IImageService _imageService;

        public RescueReportsController(PetRescueDbContext context, ILocationService locationService, IImageService imageService)
        {
            _context = context;
            _locationService = locationService;
            _imageService = imageService;
        }

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RescueReportDto>>> GetUserRescueReports(Guid userId)
        {
            // Ensure user can only access their own reports (unless they're admin/shelter/vet)
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (currentUserId != userId.ToString() &&
                userRole != "admin" && userRole != "shelter" && userRole != "veterinarian")
            {
                return Forbid();
            }

            var reports = await _context.RescueReports
                .Include(r => r.Reporter)
                .Include(r => r.AssignedOrganization)
                .Include(r => r.Photos)
                .Where(r => r.ReporterId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var result = reports.Select(r => new RescueReportDto
            {
                Id = r.Id,
                AnimalType = r.AnimalType,
                Breed = r.Breed,
                Size = r.Size,
                Color = r.Color,
                Description = r.Description,
                Location = r.Location,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                UrgencyLevel = r.UrgencyLevel,
                AnimalCondition = r.AnimalCondition,
                InjuredOrSick = r.InjuredOrSick,
                InjuryDescription = r.InjuryDescription,
                ReporterName = r.ReporterName,
                ReporterPhone = r.ReporterPhone,
                ReporterEmail = r.ReporterEmail,
                Status = r.Status,
                AssignedOrganizationId = r.AssignedOrganizationId,
                AssignedOrganizationName = r.AssignedOrganization?.Name,
                CreatedAt = r.CreatedAt,
                Photos = r.Photos.Select(p => new RescuePhotoDto
                {
                    Id = p.Id,
                    FilePath = p.FilePath,
                    FileName = p.FileName
                }).ToList()
            });

            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<IEnumerable<RescueReportDto>>> GetRescueReports(
            [FromQuery] string? status = null,
            [FromQuery] string? urgency = null,
            [FromQuery] Guid? organizationId = null,
            [FromQuery] string sortBy = "date",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.RescueReports
                .Include(r => r.Reporter)
                .Include(r => r.AssignedOrganization)
                .Include(r => r.Photos)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            if (!string.IsNullOrEmpty(urgency))
            {
                query = query.Where(r => r.UrgencyLevel == urgency);
            }

            if (organizationId.HasValue)
            {
                query = query.Where(r => r.AssignedOrganizationId == organizationId.Value);
            }

            // Apply sorting
            query = sortBy.ToLower() switch
            {
                "date" => query.OrderByDescending(r => r.CreatedAt),
                "urgency" => query.OrderBy(r => r.UrgencyLevel == "Critical" ? 0 : 
                                                r.UrgencyLevel == "High" ? 1 : 
                                                r.UrgencyLevel == "Medium" ? 2 : 3),
                "location" => query.OrderBy(r => r.Location),
                _ => query.OrderByDescending(r => r.CreatedAt)
            };

            // Apply pagination
            var totalCount = await query.CountAsync();
            var reports = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = reports.Select(r => new RescueReportDto
            {
                Id = r.Id,
                AnimalType = r.AnimalType,
                Breed = r.Breed,
                Size = r.Size,
                Color = r.Color,
                Description = r.Description,
                Location = r.Location,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                UrgencyLevel = r.UrgencyLevel,
                AnimalCondition = r.AnimalCondition,
                InjuredOrSick = r.InjuredOrSick,
                InjuryDescription = r.InjuryDescription,
                ReporterName = r.ReporterName,
                ReporterPhone = r.ReporterPhone,
                ReporterEmail = r.ReporterEmail,
                Status = r.Status,
                AssignedOrganizationId = r.AssignedOrganizationId,
                AssignedOrganizationName = r.AssignedOrganization?.Name,
                CreatedAt = r.CreatedAt,
                Photos = r.Photos.Select(p => new RescuePhotoDto
                {
                    Id = p.Id,
                    FilePath = p.FilePath,
                    FileName = p.FileName
                }).ToList()
            });

            return Ok(new
            {
                reports = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<RescueReportDto>> GetRescueReport(Guid id)
        {
            var report = await _context.RescueReports
                .Include(r => r.Reporter)
                .Include(r => r.AssignedOrganization)
                .Include(r => r.Photos)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
            {
                return NotFound();
            }

            var result = new RescueReportDto
            {
                Id = report.Id,
                AnimalType = report.AnimalType,
                Breed = report.Breed,
                Size = report.Size,
                Color = report.Color,
                Description = report.Description,
                Location = report.Location,
                Latitude = report.Latitude,
                Longitude = report.Longitude,
                UrgencyLevel = report.UrgencyLevel,
                AnimalCondition = report.AnimalCondition,
                InjuredOrSick = report.InjuredOrSick,
                InjuryDescription = report.InjuryDescription,
                ReporterName = report.ReporterName,
                ReporterPhone = report.ReporterPhone,
                ReporterEmail = report.ReporterEmail,
                Status = report.Status,
                AssignedOrganizationId = report.AssignedOrganizationId,
                AssignedOrganizationName = report.AssignedOrganization?.Name,
                CreatedAt = report.CreatedAt,
                Photos = report.Photos.Select(p => new RescuePhotoDto
                {
                    Id = p.Id,
                    FilePath = p.FilePath,
                    FileName = p.FileName
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPost("json")]
        public async Task<ActionResult<RescueReportDto>> CreateRescueReportJson([FromBody] CreateRescueReportRequest request)
        {
            // Debug logging
            Console.WriteLine($"JSON Rescue report request received:");
            Console.WriteLine($"AnimalType: '{request?.AnimalType}'");
            Console.WriteLine($"Location: '{request?.Location}'");
            Console.WriteLine($"Latitude: {request?.Latitude}");
            Console.WriteLine($"Longitude: {request?.Longitude}");
            Console.WriteLine($"ReporterName: '{request?.ReporterName}'");
            Console.WriteLine($"ReporterPhone: '{request?.ReporterPhone}'");
            Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request == null)
            {
                return BadRequest("Request cannot be null");
            }

            // Create rescue report entity
            var rescueReport = new RescueReport
            {
                Id = Guid.NewGuid(),
                AnimalType = request.AnimalType,
                Breed = request.Breed,
                Size = request.Size,
                Color = request.Color,
                Description = request.Description,
                Location = request.Location,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                UrgencyLevel = request.UrgencyLevel,
                AnimalCondition = request.AnimalCondition,
                InjuredOrSick = request.InjuredOrSick,
                InjuryDescription = request.InjuryDescription,
                ReporterName = request.ReporterName,
                ReporterPhone = request.ReporterPhone,
                ReporterEmail = request.ReporterEmail,
                Status = "reported",
                CreatedAt = DateTime.UtcNow
            };

            _context.RescueReports.Add(rescueReport);
            await _context.SaveChangesAsync();

            var result = new RescueReportDto
            {
                Id = rescueReport.Id,
                AnimalType = rescueReport.AnimalType,
                Breed = rescueReport.Breed,
                Size = rescueReport.Size,
                Color = rescueReport.Color,
                Description = rescueReport.Description,
                Location = rescueReport.Location,
                Latitude = rescueReport.Latitude,
                Longitude = rescueReport.Longitude,
                UrgencyLevel = rescueReport.UrgencyLevel,
                AnimalCondition = rescueReport.AnimalCondition,
                InjuredOrSick = rescueReport.InjuredOrSick,
                InjuryDescription = rescueReport.InjuryDescription,
                ReporterName = rescueReport.ReporterName,
                ReporterPhone = rescueReport.ReporterPhone,
                ReporterEmail = rescueReport.ReporterEmail,
                Status = rescueReport.Status,
                CreatedAt = rescueReport.CreatedAt,
                Photos = new List<RescuePhotoDto>() // No photos for JSON endpoint
            };

            return CreatedAtAction(nameof(GetRescueReport), new { id = result.Id }, result);
        }

        [HttpGet("unhandled/count")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<ActionResult<object>> GetUnhandledReportsCount()
        {
            var count = await _context.RescueReports
                .Where(r => r.Status == "reported" || r.AssignedOrganizationId == null)
                .CountAsync();

            return Ok(new { count });
        }

        [HttpPost]
        public async Task<ActionResult<RescueReportDto>> CreateRescueReport([FromForm] CreateRescueReportRequest request, [FromForm] List<IFormFile>? photos = null)
        {
            var contentType = Request.ContentType ?? "";

            // Debug logging
            Console.WriteLine($"Rescue report request received:");
            Console.WriteLine($"Content-Type: {contentType}");
            Console.WriteLine($"Photos count: {photos?.Count ?? 0}");
            Console.WriteLine($"AnimalType: '{request?.AnimalType}'");
            Console.WriteLine($"Location: '{request?.Location}'");
            Console.WriteLine($"Latitude: {request?.Latitude}");
            Console.WriteLine($"Longitude: {request?.Longitude}");
            Console.WriteLine($"ReporterName: '{request?.ReporterName}'");
            Console.WriteLine($"ReporterPhone: '{request?.ReporterPhone}'");
            Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");

            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState errors:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"  {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }

            // Validate coordinates (allow 0,0 for now as default)
            if (request?.Latitude < -90 || request?.Latitude > 90)
            {
                Console.WriteLine($"Invalid latitude: {request.Latitude}");
                return BadRequest("Latitude must be between -90 and 90 degrees");
            }

            if (request?.Longitude < -180 || request?.Longitude > 180)
            {
                Console.WriteLine($"Invalid longitude: {request.Longitude}");
                return BadRequest("Longitude must be between -180 and 180 degrees");
            }

            // Round coordinates to prevent precision overflow
            var roundedLatitude = Math.Round(request?.Latitude ?? 0, 8);
            var roundedLongitude = Math.Round(request?.Longitude ?? 0, 8);
            Console.WriteLine($"Rounded coordinates: Lat={roundedLatitude}, Lng={roundedLongitude}");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? reporterId = null;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out Guid userId))
            {
                reporterId = userId;
            }

            var report = new RescueReport
            {
                AnimalType = request?.AnimalType ?? "",
                Breed = request?.Breed,
                Size = request?.Size,
                Color = request?.Color,
                Description = request?.Description,
                Location = request?.Location ?? "",
                Latitude = roundedLatitude,
                Longitude = roundedLongitude,
                UrgencyLevel = request?.UrgencyLevel ?? "moderate",
                AnimalCondition = request?.AnimalCondition ?? "Unknown",
                InjuredOrSick = request?.InjuredOrSick ?? false,
                InjuryDescription = request?.InjuryDescription,
                ReporterName = request?.ReporterName ?? "",
                ReporterPhone = request?.ReporterPhone ?? "",
                ReporterEmail = request?.ReporterEmail,
                ReporterId = reporterId,
                Status = "reported",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RescueReports.Add(report);
            await _context.SaveChangesAsync();

            // Handle photo uploads
            if (photos != null && photos.Count > 0)
            {
                await ProcessPhotoUploads(report.Id, photos);
            }

            // Auto-assignment temporarily disabled due to Organization.Type mapping issue
            // await AutoAssignToNearestOrganization(report);

            return CreatedAtAction(nameof(GetRescueReport), new { id = report.Id }, report.Id);
        }

        private async Task ProcessPhotoUploads(Guid rescueReportId, List<IFormFile> photos)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            const long maxFileSize = 5 * 1024 * 1024; // 5MB

            // Create upload directory if it doesn't exist
            var uploadPath = Path.Combine("wwwroot", "uploads", "rescue-photos");
            Directory.CreateDirectory(uploadPath);

            foreach (var photo in photos.Take(5)) // Limit to 5 photos
            {
                // Validate file
                var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    continue; // Skip invalid files
                }

                if (photo.Length > maxFileSize)
                {
                    continue; // Skip files that are too large
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await photo.CopyToAsync(stream);
                }

                // Create database record
                var rescuePhoto = new RescuePhoto
                {
                    RescueReportId = rescueReportId,
                    FilePath = Path.Combine("uploads", "rescue-photos", fileName),
                    FileName = photo.FileName,
                    ContentType = photo.ContentType,
                    FileSize = photo.Length,
                    CreatedAt = DateTime.UtcNow
                };

                _context.RescuePhotos.Add(rescuePhoto);
            }

            await _context.SaveChangesAsync();
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> AssignRescueReport(Guid id, [FromBody] AssignRescueRequest? request = null)
        {
            var report = await _context.RescueReports.FindAsync(id);
            if (report == null)
            {
                return NotFound();
            }

            // Check if report is already assigned
            if (report.AssignedOrganizationId != null)
            {
                return BadRequest("Report is already assigned to another organization");
            }

            // Get current user's organization ID from claims or user lookup
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized();
            }

            // Find user's organization
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized();
            }

            // For now, create a mock organization ID based on user ID
            // In production, this should be properly linked to user's organization
            var organizationId = Guid.NewGuid(); // Mock organization ID

            report.AssignedOrganizationId = organizationId;
            report.Status = "Assigned";
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // TODO: Send notification to reporter about assignment
            await NotifyReporterOfAssignment(report, user);

            return NoContent();
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Shelter,Veterinarian")]
        public async Task<IActionResult> UpdateRescueStatus(Guid id, [FromBody] UpdateRescueStatusRequest request)
        {
            var report = await _context.RescueReports.FindAsync(id);
            if (report == null)
            {
                return NotFound();
            }

            // Check if user has permission to update this rescue
            var organizationIdClaim = User.FindFirst("OrganizationId")?.Value;
            if (string.IsNullOrEmpty(organizationIdClaim) || 
                !Guid.TryParse(organizationIdClaim, out Guid organizationId) ||
                report.AssignedOrganizationId != organizationId)
            {
                return Forbid();
            }

            report.Status = request.Status;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task NotifyReporterOfAssignment(RescueReport report, User assignedUser)
        {
            // TODO: Implement email notification service
            // For now, just log the notification
            Console.WriteLine($"NOTIFICATION: Report {report.Id} has been assigned to {assignedUser.FirstName} {assignedUser.LastName}");
            Console.WriteLine($"Reporter {report.ReporterName} should be notified at {report.ReporterEmail}");

            // In production, this would send an email like:
            // "Your rescue report for {report.AnimalType} has been claimed by {assignedUser.FirstName} {assignedUser.LastName}"
            // "Contact: {assignedUser.Phone} / {assignedUser.Email}"
        }

        private async Task AutoAssignToNearestOrganization(RescueReport report)
        {
            var organizations = await _context.Organizations
                .Where(o => o.Type == "Animal Shelter" || o.Type == "Rescue Organization")
                .ToListAsync();

            if (!organizations.Any()) return;

            var nearestOrg = organizations
                .Select(o => new {
                    Organization = o,
                    Distance = _locationService.CalculateDistance(
                        (double)report.Latitude, (double)report.Longitude,
                        (double)o.Latitude, (double)o.Longitude)
                })
                .OrderBy(x => x.Distance)
                .First();

            if (nearestOrg.Distance <= 50) // Within 50km
            {
                report.AssignedOrganizationId = nearestOrg.Organization.Id;
                report.Status = "Assigned";
                await _context.SaveChangesAsync();
            }
        }
    }
}
