namespace PetRescueConnect.API.DTOs
{
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public int Capacity { get; set; }
        public int CurrentAnimals { get; set; }
        public string[] Specialties { get; set; } = Array.Empty<string>();
        public string[] Services { get; set; } = Array.Empty<string>();
        public Dictionary<string, string> Hours { get; set; } = new();
        public bool Featured { get; set; }
        public double? Distance { get; set; }
    }
}
