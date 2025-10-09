using Microsoft.AspNetCore.Mvc;
using PetRescueConnect.API.Services;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IDatabaseHealthService _databaseHealthService;
        private readonly ILogger<HealthController> _logger;

        public HealthController(IDatabaseHealthService databaseHealthService, ILogger<HealthController> logger)
        {
            _databaseHealthService = databaseHealthService;
            _logger = logger;
        }

        /// <summary>
        /// Basic health check endpoint
        /// </summary>
        [HttpGet]
        public IActionResult GetHealth()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }

        /// <summary>
        /// Detailed database health check
        /// </summary>
        [HttpGet("database")]
        public async Task<IActionResult> GetDatabaseHealth()
        {
            try
            {
                var healthStatus = await _databaseHealthService.GetHealthStatusAsync();
                
                if (healthStatus.OverallHealth)
                {
                    return Ok(healthStatus);
                }
                else
                {
                    return StatusCode(503, healthStatus); // Service Unavailable
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new
                {
                    status = "unhealthy",
                    error = "Health check failed",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Test database connection
        /// </summary>
        [HttpGet("database/connection")]
        public async Task<IActionResult> TestDatabaseConnection()
        {
            try
            {
                var isHealthy = await _databaseHealthService.CheckConnectionAsync();
                
                if (isHealthy)
                {
                    return Ok(new
                    {
                        status = "connected",
                        message = "Database connection is healthy",
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    return StatusCode(503, new
                    {
                        status = "disconnected",
                        message = "Database connection failed",
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return StatusCode(500, new
                {
                    status = "error",
                    message = "Connection test failed",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Test database schema integrity
        /// </summary>
        [HttpGet("database/schema")]
        public async Task<IActionResult> TestDatabaseSchema()
        {
            try
            {
                var isHealthy = await _databaseHealthService.CheckSchemaIntegrityAsync();
                
                if (isHealthy)
                {
                    return Ok(new
                    {
                        status = "valid",
                        message = "Database schema is valid",
                        timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    return StatusCode(503, new
                    {
                        status = "invalid",
                        message = "Database schema validation failed",
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database schema test failed");
                return StatusCode(500, new
                {
                    status = "error",
                    message = "Schema test failed",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
