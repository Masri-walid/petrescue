using Microsoft.AspNetCore.Mvc;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { 
                message = "PetRescue Connect API is running!", 
                timestamp = DateTime.UtcNow 
            });
        }

        [HttpPost("register")]
        public IActionResult TestRegister([FromBody] TestRegisterRequest request)
        {
            return Ok(new { 
                success = true,
                message = "Test registration successful",
                data = new {
                    email = request.Email,
                    firstName = request.FirstName,
                    lastName = request.LastName,
                    userType = request.UserType
                }
            });
        }

        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }
    }

    public class TestRegisterRequest
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string UserType { get; set; } = "";
    }
}
