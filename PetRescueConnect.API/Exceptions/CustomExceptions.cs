namespace PetRescueConnect.API.Exceptions
{
    public class SchemaMismatchException : Exception
    {
        public string TableName { get; }
        public string ColumnName { get; }

        public SchemaMismatchException(string tableName, string columnName, string message) 
            : base(message)
        {
            TableName = tableName;
            ColumnName = columnName;
        }

        public SchemaMismatchException(string tableName, string columnName, string message, Exception innerException) 
            : base(message, innerException)
        {
            TableName = tableName;
            ColumnName = columnName;
        }
    }

    public class DatabaseConnectionException : Exception
    {
        public string ConnectionString { get; }

        public DatabaseConnectionException(string connectionString, string message) 
            : base(message)
        {
            ConnectionString = connectionString;
        }

        public DatabaseConnectionException(string connectionString, string message, Exception innerException) 
            : base(message, innerException)
        {
            ConnectionString = connectionString;
        }
    }

    public class ValidationException : Exception
    {
        public Dictionary<string, string[]> Errors { get; }

        public ValidationException(Dictionary<string, string[]> errors) 
            : base("One or more validation errors occurred")
        {
            Errors = errors;
        }

        public ValidationException(string field, string error) 
            : base($"Validation error in field '{field}': {error}")
        {
            Errors = new Dictionary<string, string[]>
            {
                { field, new[] { error } }
            };
        }
    }

    public class ResourceNotFoundException : Exception
    {
        public string ResourceType { get; }
        public string ResourceId { get; }

        public ResourceNotFoundException(string resourceType, string resourceId) 
            : base($"{resourceType} with ID '{resourceId}' was not found")
        {
            ResourceType = resourceType;
            ResourceId = resourceId;
        }
    }

    public class BusinessRuleException : Exception
    {
        public string RuleCode { get; }

        public BusinessRuleException(string ruleCode, string message) 
            : base(message)
        {
            RuleCode = ruleCode;
        }
    }
}
