using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Interfaces;
using PetRescueConnect.API.Models;

namespace PetRescueConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] string? userType = null)
        {
            try
            {
                IEnumerable<User> users;
                
                if (!string.IsNullOrEmpty(userType))
                {
                    users = await _userRepository.GetUsersByTypeAsync(userType);
                }
                else
                {
                    users = await _userRepository.GetAllAsync();
                }

                var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDto>> GetUser(Guid id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("{id}/with-organizations")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDto>> GetUserWithOrganizations(Guid id)
        {
            try
            {
                var user = await _userRepository.GetUserWithOrganizationsAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                _mapper.Map(updateUserDto, user);
                user.UpdatedAt = DateTime.UtcNow;

                var updatedUser = await _userRepository.UpdateAsync(user);
                var userDto = _mapper.Map<UserDto>(updatedUser);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteUser(Guid id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                await _userRepository.DeleteAsync(user);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
