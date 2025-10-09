namespace PetRescueConnect.API.DTOs
{
    public class ImageUploadResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        // TempId removed - no longer needed
    }

    // Temporary photo DTOs removed for simplification
}
