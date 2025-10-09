using Npgsql;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=localhost;Database=petrescue_connect;Username=postgres;Password=postgres";
        
        try
        {
            using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            
            Console.WriteLine("Connected to PostgreSQL");
            
            // Install PostGIS extension
            using var cmd = new NpgsqlCommand("CREATE EXTENSION IF NOT EXISTS postgis;", conn);
            await cmd.ExecuteNonQueryAsync();
            Console.WriteLine("PostGIS extension installed");
            
            // Verify installation
            using var verifyCmd = new NpgsqlCommand("SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';", conn);
            using var reader = await verifyCmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                Console.WriteLine($"PostGIS version: {reader["extversion"]}");
            }
            else
            {
                Console.WriteLine("PostGIS not found");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
