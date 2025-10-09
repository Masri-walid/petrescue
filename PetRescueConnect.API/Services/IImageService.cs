using PetRescueConnect.API.DTOs;

namespace PetRescueConnect.API.Services
{
    public interface IImageService
    {
        Task<ImageUploadResult> UploadImageAsync(IFormFile file, string category);
        Task<List<ImageUploadResult>> UploadMultipleImagesAsync(IFormFileCollection files, string category);
        Task<bool> DeleteImageAsync(string filePath);
        string GetImageUrl(string filePath);
        bool IsValidImageFile(IFormFile file);
    }
}
