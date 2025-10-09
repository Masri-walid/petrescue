using Microsoft.EntityFrameworkCore;
using Npgsql;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Exceptions;

namespace PetRescueConnect.API.Services
{
    public interface IDatabaseHealthService
    {
        Task<bool> CheckConnectionAsync();
        Task<bool> CheckSchemaIntegrityAsync();
        Task<DatabaseHealthStatus> GetHealthStatusAsync();
    }

    public class DatabaseHealthService : IDatabaseHealthService
    {
        private readonly PetRescueDbContext _context;
        private readonly ILogger<DatabaseHealthService> _logger;

        public DatabaseHealthService(PetRescueDbContext context, ILogger<DatabaseHealthService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> CheckConnectionAsync()
        {
            try
            {
                await _context.Database.OpenConnectionAsync();
                await _context.Database.CloseConnectionAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection check failed");
                return false;
            }
        }

        public async Task<bool> CheckSchemaIntegrityAsync()
        {
            try
            {
                // Test basic queries to verify schema integrity
                await _context.Users.CountAsync();
                await _context.Organizations.CountAsync();
                await _context.Animals.CountAsync();
                await _context.RescueReports.CountAsync();
                
                return true;
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "42703" || pgEx.SqlState == "42P01")
            {
                _logger.LogError(pgEx, "Schema integrity check failed - missing table or column");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Schema integrity check failed");
                return false;
            }
        }

        public async Task<DatabaseHealthStatus> GetHealthStatusAsync()
        {
            var status = new DatabaseHealthStatus();
            
            try
            {
                status.IsConnectionHealthy = await CheckConnectionAsync();
                
                if (status.IsConnectionHealthy)
                {
                    status.IsSchemaHealthy = await CheckSchemaIntegrityAsync();
                    
                    if (status.IsSchemaHealthy)
                    {
                        // Get basic statistics
                        status.UserCount = await _context.Users.CountAsync();
                        status.OrganizationCount = await _context.Organizations.CountAsync();
                        status.AnimalCount = await _context.Animals.CountAsync();
                        status.ReportCount = await _context.RescueReports.CountAsync();
                    }
                }
                
                status.LastChecked = DateTime.UtcNow;
                status.OverallHealth = status.IsConnectionHealthy && status.IsSchemaHealthy;
                
                return status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get database health status");
                status.ErrorMessage = ex.Message;
                status.LastChecked = DateTime.UtcNow;
                return status;
            }
        }
    }

    public class DatabaseHealthStatus
    {
        public bool IsConnectionHealthy { get; set; }
        public bool IsSchemaHealthy { get; set; }
        public bool OverallHealth { get; set; }
        public int UserCount { get; set; }
        public int OrganizationCount { get; set; }
        public int AnimalCount { get; set; }
        public int ReportCount { get; set; }
        public DateTime LastChecked { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
