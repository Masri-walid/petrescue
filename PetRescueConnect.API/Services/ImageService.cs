using Microsoft.EntityFrameworkCore;
using PetRescueConnect.API.Data;
using PetRescueConnect.API.Models;
using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Services
{
    public class ImageService : IImageService
    {
        private readonly IConfiguration _configuration;
        private readonly PetRescueDbContext _context;
        private readonly string _basePath;
        private readonly long _maxFileSizeInBytes;
        private readonly string[] _allowedExtensions;

        public ImageService(IConfiguration configuration, PetRescueDbContext context)
        {
            _configuration = configuration;
            _context = context;
            _basePath = _configuration["ImageStorage:BasePath"] ?? "wwwroot/uploads";
            _maxFileSizeInBytes = (_configuration.GetValue<int>("ImageStorage:MaxFileSizeInMB", 10)) * 1024 * 1024;
            _allowedExtensions = _configuration.GetSection("ImageStorage:AllowedExtensions").Get<string[]>() ?? 
                                new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

            // Ensure upload directories exist
            EnsureDirectoriesExist();
        }

        public async Task<ImageUploadResult> UploadImageAsync(IFormFile file, string category)
        {
            if (!IsValidImageFile(file))
            {
                return new ImageUploadResult
                {
                    Success = false,
                    Message = "Invalid file type or size"
                };
            }

            try
            {
                var fileName = GenerateUniqueFileName(file.FileName);
                var categoryPath = Path.Combine(_basePath, category);
                var filePath = Path.Combine(categoryPath, fileName);
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath);

                Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return new ImageUploadResult
                {
                    Success = true,
                    FilePath = filePath.Replace('\\', '/'),
                    FileName = fileName,
                    OriginalFileName = file.FileName,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    Url = GetImageUrl(filePath.Replace('\\', '/'))
                };
            }
            catch (Exception ex)
            {
                return new ImageUploadResult
                {
                    Success = false,
                    Message = $"Upload failed: {ex.Message}"
                };
            }
        }

        // Temporary photo functionality removed for simplification

        public async Task<List<ImageUploadResult>> UploadMultipleImagesAsync(IFormFileCollection files, string category)
        {
            var results = new List<ImageUploadResult>();

            foreach (var file in files)
            {
                var result = await UploadImageAsync(file, category);
                results.Add(result);
            }

            return results;
        }

        public Task<bool> DeleteImageAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath);
                
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }

                // Temporary photo cleanup removed

                return Task.FromResult(true);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }

        // Temporary photo methods removed for simplification

        public string GetImageUrl(string filePath)
        {
            return $"/uploads/{filePath.Replace(_basePath + "/", "").Replace("\\", "/")}";
        }

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > _maxFileSizeInBytes)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Check content type
            var allowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        private string GenerateUniqueFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName);
            var uniqueName = $"{Guid.NewGuid()}{extension}";
            return uniqueName;
        }

        private void EnsureDirectoriesExist()
        {
            var directories = new[]
            {
                Path.Combine(_basePath, "animals"),
                Path.Combine(_basePath, "rescues"),
                Path.Combine(_basePath, "organizations")
            };

            foreach (var directory in directories)
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), directory);
                Directory.CreateDirectory(fullPath);
            }
        }
    }
}
