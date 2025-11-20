using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Globalization;

namespace PetRescueConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotoComparisonController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public PhotoComparisonController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("compare")]
        public async Task<ActionResult> ComparePhoto([FromForm] IFormFile photo, [FromForm] double threshold = 0.7)
        {
            try
            {
                if (photo == null || photo.Length == 0)
                {
                    return BadRequest(new { message = "No photo provided" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(photo.ContentType.ToLower()))
                {
                    return BadRequest(new { message = "Invalid file type. Only images are allowed." });
                }

                // Validate file size (max 10MB)
                if (photo.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size exceeds 10MB limit" });
                }

                // Create multipart form data
                using var content = new MultipartFormDataContent();
                using var photoStream = photo.OpenReadStream();
                using var streamContent = new StreamContent(photoStream);
                
                streamContent.Headers.ContentType = new MediaTypeHeaderValue(photo.ContentType);
                content.Add(streamContent, "photo", photo.FileName);
                content.Add(new StringContent(threshold.ToString(CultureInfo.InvariantCulture)), "threshold");

                // Call Python ML service
                var mlServiceUrl = _configuration["MLService:Url"] ?? "http://localhost:5001";
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromMinutes(5); // ML processing can take time

                var response = await httpClient.PostAsync($"{mlServiceUrl}/api/compare-photo", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { message = "ML service error", error = errorContent });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("health")]
        public async Task<ActionResult> CheckMLServiceHealth()
        {
            try
            {
                var mlServiceUrl = _configuration["MLService:Url"] ?? "http://localhost:5001";
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(10);

                var response = await httpClient.GetAsync($"{mlServiceUrl}/health");
                
                if (response.IsSuccessStatusCode)
                {
                    return Ok(new { status = "ML service is healthy" });
                }
                else
                {
                    return StatusCode(503, new { status = "ML service is unavailable" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { status = "ML service is unavailable", error = ex.Message });
            }
        }
    }
}

