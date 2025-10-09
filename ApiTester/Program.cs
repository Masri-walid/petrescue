using System.Text;
using System.Text.Json;

Console.WriteLine("🧪 Testing PetRescue Connect API...");

var baseUrl = "http://localhost:5010/api";
var httpClient = new HttpClient();

try
{
    // Test 1: Login with existing test user
    Console.WriteLine("\n1. Testing user login...");
    var loginData = new
    {
        email = "user@example.com",
        password = "string"
    };

    var loginJson = JsonSerializer.Serialize(loginData);
    var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");

    var loginResponse = await httpClient.PostAsync($"{baseUrl}/Auth/login", loginContent);
    var loginResponseText = await loginResponse.Content.ReadAsStringAsync();

    if (loginResponse.IsSuccessStatusCode)
    {
        Console.WriteLine("✅ Login successful!");
        
        using var loginDoc = JsonDocument.Parse(loginResponseText);
        var root = loginDoc.RootElement;
        
        if (root.TryGetProperty("user", out var userElement))
        {
            var userId = userElement.GetProperty("id").GetString();
            var email = userElement.GetProperty("email").GetString();
            var firstName = userElement.GetProperty("firstName").GetString();
            var lastName = userElement.GetProperty("lastName").GetString();
            
            Console.WriteLine($"User ID: {userId}");
            Console.WriteLine($"Email: {email}");
            Console.WriteLine($"Name: {firstName} {lastName}");
        }
        
        if (root.TryGetProperty("token", out var tokenElement))
        {
            var token = tokenElement.GetString();
            Console.WriteLine($"Token: {token?[..50]}...");
        }
    }
    else
    {
        Console.WriteLine($"❌ Login failed: {loginResponse.StatusCode}");
        Console.WriteLine($"Response: {loginResponseText}");
    }

    // Test 2: Register a new user
    Console.WriteLine("\n2. Testing user registration...");
    var registerData = new
    {
        firstName = "New",
        lastName = "User",
        email = "newuser@example.com",
        password = "password123",
        role = "citizen"
    };

    var registerJson = JsonSerializer.Serialize(registerData);
    var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");

    var registerResponse = await httpClient.PostAsync($"{baseUrl}/Auth/register", registerContent);
    var registerResponseText = await registerResponse.Content.ReadAsStringAsync();

    if (registerResponse.IsSuccessStatusCode)
    {
        Console.WriteLine("✅ Registration successful!");
        
        using var registerDoc = JsonDocument.Parse(registerResponseText);
        var root = registerDoc.RootElement;
        
        if (root.TryGetProperty("user", out var userElement))
        {
            var userId = userElement.GetProperty("id").GetString();
            var email = userElement.GetProperty("email").GetString();
            
            Console.WriteLine($"New User ID: {userId}");
            Console.WriteLine($"Email: {email}");
        }
    }
    else
    {
        Console.WriteLine($"❌ Registration failed: {registerResponse.StatusCode}");
        Console.WriteLine($"Response: {registerResponseText}");
    }

    Console.WriteLine("\n🎉 API testing completed!");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Test failed: {ex.Message}");
}
finally
{
    httpClient.Dispose();
}
