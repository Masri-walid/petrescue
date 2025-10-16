using Microsoft.EntityFrameworkCore;
using Npgsql;
using PetRescueConnect.API.Exceptions;
using System.Net;
using System.Text.Json;

namespace PetRescueConnect.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            var response = new ErrorResponse();

            switch (exception)
            {
                case SchemaMismatchException schemaEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.InternalServerError,
                        Message = "Database schema mismatch",
                        Details = $"Schema mismatch in table '{schemaEx.TableName}', column '{schemaEx.ColumnName}': {schemaEx.Message}",
                        ErrorCode = "SCHEMA_MISMATCH"
                    };
                    break;
                case DatabaseConnectionException dbConnEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.ServiceUnavailable,
                        Message = "Database connection failed",
                        Details = dbConnEx.Message,
                        ErrorCode = "DATABASE_CONNECTION_FAILED"
                    };
                    break;
                case ValidationException validEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.BadRequest,
                        Message = "Validation failed",
                        Details = string.Join("; ", validEx.Errors.SelectMany(e => e.Value.Select(v => $"{e.Key}: {v}"))),
                        ErrorCode = "VALIDATION_FAILED"
                    };
                    break;
                case ResourceNotFoundException resEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.NotFound,
                        Message = "Resource not found",
                        Details = resEx.Message,
                        ErrorCode = "RESOURCE_NOT_FOUND"
                    };
                    break;
                case BusinessRuleException bizEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.BadRequest,
                        Message = "Business rule violation",
                        Details = bizEx.Message,
                        ErrorCode = bizEx.RuleCode
                    };
                    break;
                case PostgresException pgEx:
                    response = HandlePostgresException(pgEx);
                    break;
                case DbUpdateException dbEx:
                    response = HandleDbUpdateException(dbEx);
                    break;
                case InvalidOperationException invEx when invEx.Message.Contains("schema"):
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.InternalServerError,
                        Message = "Database schema mismatch detected",
                        Details = "The database schema doesn't match the application model. Please check column mappings.",
                        ErrorCode = "SCHEMA_MISMATCH"
                    };
                    break;
                case ArgumentException argEx:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.BadRequest,
                        Message = "Invalid argument provided",
                        Details = argEx.Message,
                        ErrorCode = "INVALID_ARGUMENT"
                    };
                    break;
                case UnauthorizedAccessException:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.Unauthorized,
                        Message = "Access denied",
                        Details = "You don't have permission to access this resource",
                        ErrorCode = "ACCESS_DENIED"
                    };
                    break;
                case KeyNotFoundException:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.NotFound,
                        Message = "Resource not found",
                        Details = "The requested resource could not be found",
                        ErrorCode = "NOT_FOUND"
                    };
                    break;
                default:
                    response = new ErrorResponse
                    {
                        StatusCode = (int)HttpStatusCode.InternalServerError,
                        Message = "An internal server error occurred",
                        Details = "Please try again later or contact support if the problem persists",
                        ErrorCode = "INTERNAL_ERROR"
                    };
                    break;
            }

            context.Response.StatusCode = response.StatusCode;
            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        private static ErrorResponse HandlePostgresException(PostgresException pgEx)
        {
            // Log the actual PostgreSQL error for debugging
            Console.WriteLine($"DEBUG: PostgreSQL Error - SqlState: {pgEx.SqlState}, Message: {pgEx.Message}");
            Console.WriteLine($"DEBUG: Full exception: {pgEx}");

            return pgEx.SqlState switch
            {
                "42703" => new ErrorResponse // Column does not exist
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "Database column not found",
                    Details = $"Column '{ExtractColumnName(pgEx.Message)}' does not exist in the database. This indicates a schema mismatch. Full error: {pgEx.Message}",
                    ErrorCode = "COLUMN_NOT_FOUND"
                },
                "42P01" => new ErrorResponse // Table does not exist
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "Database table not found",
                    Details = "Required database table does not exist. Please ensure the database is properly initialized.",
                    ErrorCode = "TABLE_NOT_FOUND"
                },
                "23505" => new ErrorResponse // Unique constraint violation
                {
                    StatusCode = (int)HttpStatusCode.Conflict,
                    Message = "Duplicate entry",
                    Details = "A record with this information already exists",
                    ErrorCode = "DUPLICATE_ENTRY"
                },
                "23503" => new ErrorResponse // Foreign key constraint violation
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = "Invalid reference",
                    Details = "Referenced record does not exist",
                    ErrorCode = "INVALID_REFERENCE"
                },
                "23502" => new ErrorResponse // Not null constraint violation
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = "Required field missing",
                    Details = "A required field was not provided",
                    ErrorCode = "REQUIRED_FIELD_MISSING"
                },
                "08006" => new ErrorResponse // Connection failure
                {
                    StatusCode = (int)HttpStatusCode.ServiceUnavailable,
                    Message = "Database connection failed",
                    Details = "Unable to connect to the database. Please try again later.",
                    ErrorCode = "DATABASE_CONNECTION_FAILED"
                },
                _ => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "Database error occurred",
                    Details = "A database error occurred. Please try again later.",
                    ErrorCode = "DATABASE_ERROR"
                }
            };
        }

        private static ErrorResponse HandleDbUpdateException(DbUpdateException dbEx)
        {
            if (dbEx.InnerException is PostgresException pgEx)
            {
                return HandlePostgresException(pgEx);
            }

            return new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Message = "Database update failed",
                Details = "Failed to save changes to the database",
                ErrorCode = "UPDATE_FAILED"
            };
        }

        private static string ExtractColumnName(string errorMessage)
        {
            // Extract column name from PostgreSQL error message
            var parts = errorMessage.Split('"');
            return parts.Length > 1 ? parts[1] : "unknown";
        }
    }

    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
