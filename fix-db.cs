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
            
            // Make coordinates column nullable
            using var cmd = new NpgsqlCommand("ALTER TABLE rescue_reports ALTER COLUMN coordinates DROP NOT NULL;", conn);
            await cmd.ExecuteNonQueryAsync();
            Console.WriteLine("Made coordinates column nullable");
            
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
