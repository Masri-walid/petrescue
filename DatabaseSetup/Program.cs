using Npgsql;
using System.Text;

Console.WriteLine("🔄 Setting up PetRescue Connect database...");

// Database connection parameters
var connectionString = "Host=localhost;Database=petrescue;Username=postgres;Password=123";

try
{
    // Test connection
    Console.WriteLine("Testing database connection...");
    using var testConn = new NpgsqlConnection(connectionString);
    await testConn.OpenAsync();
    
    using var testCmd = new NpgsqlCommand("SELECT NOW()", testConn);
    var result = await testCmd.ExecuteScalarAsync();
    Console.WriteLine($"✅ Database connection successful! Server time: {result}");
    
    // Check if tables already exist
    Console.WriteLine("Checking existing tables...");
    using var checkCmd = new NpgsqlCommand(@"
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'organizations', 'animals')
        ORDER BY table_name", testConn);
    
    var existingTables = new List<string>();
    using (var reader = await checkCmd.ExecuteReaderAsync())
    {
        while (await reader.ReadAsync())
        {
            existingTables.Add(reader.GetString(0));
        }
    }
    
    if (existingTables.Count > 0)
    {
        Console.WriteLine($"Found existing tables: {string.Join(", ", existingTables)}");
        Console.Write("Do you want to recreate the tables? This will delete all existing data! (y/N): ");
        var response = Console.ReadLine()?.ToLower();
        
        if (response != "y" && response != "yes")
        {
            Console.WriteLine("Skipping table creation. Proceeding to test data insertion...");
        }
        else
        {
        
        // Drop existing tables
        Console.WriteLine("Dropping existing tables...");
        var dropTablesScript = @"
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS favorites CASCADE;
            DROP TABLE IF EXISTS reviews CASCADE;
            DROP TABLE IF EXISTS vaccinations CASCADE;
            DROP TABLE IF EXISTS medical_records CASCADE;
            DROP TABLE IF EXISTS adoption_applications CASCADE;
            DROP TABLE IF EXISTS rescue_report_photos CASCADE;
            DROP TABLE IF EXISTS rescue_reports CASCADE;
            DROP TABLE IF EXISTS animal_photos CASCADE;
            DROP TABLE IF EXISTS animals CASCADE;
            DROP TABLE IF EXISTS organization_specialties CASCADE;
            DROP TABLE IF EXISTS organization_services CASCADE;
            DROP TABLE IF EXISTS organization_hours CASCADE;
            DROP TABLE IF EXISTS user_organizations CASCADE;
            DROP TABLE IF EXISTS organizations CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        ";
        
            using var dropCmd = new NpgsqlCommand(dropTablesScript, testConn);
            await dropCmd.ExecuteNonQueryAsync();
            Console.WriteLine("✅ Existing tables dropped successfully!");

            // Create tables
            Console.WriteLine("Creating database tables...");
            var schemaScript = await File.ReadAllTextAsync("../scripts/01-create-database-schema-simplified.sql");

            using var createCmd = new NpgsqlCommand(schemaScript, testConn);
            await createCmd.ExecuteNonQueryAsync();
            Console.WriteLine("✅ Database tables created successfully!");
        }
    }
    // Insert test data
    Console.WriteLine("Inserting test data...");
    var testDataScript = await File.ReadAllTextAsync("../scripts/02-insert-test-data.sql");
    
    using var insertCmd = new NpgsqlCommand(testDataScript, testConn);
    await insertCmd.ExecuteNonQueryAsync();
    Console.WriteLine("✅ Test data inserted successfully!");
    
    // Verify test data
    Console.WriteLine("Verifying test data...");
    using var verifyCmd = new NpgsqlCommand("SELECT email, first_name, last_name FROM users WHERE email = 'user@example.com'", testConn);
    using var verifyReader = await verifyCmd.ExecuteReaderAsync();
    
    if (await verifyReader.ReadAsync())
    {
        var email = verifyReader.GetString(0);
        var firstName = verifyReader.GetString(1);
        var lastName = verifyReader.GetString(2);
        Console.WriteLine($"✅ Test user found: {firstName} {lastName} ({email})");
    }
    else
    {
        Console.WriteLine("❌ Test user not found!");
    }
    
    Console.WriteLine();
    Console.WriteLine("🎉 Database setup completed successfully!");
    Console.WriteLine("You can now test the API with:");
    Console.WriteLine("  Email: user@example.com");
    Console.WriteLine("  Password: string");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database setup failed: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    Environment.Exit(1);
}
