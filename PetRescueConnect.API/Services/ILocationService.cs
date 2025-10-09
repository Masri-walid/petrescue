namespace PetRescueConnect.API.Services
{
    public interface ILocationService
    {
        double CalculateDistance(double lat1, double lon1, double lat2, double lon2);
        Task<(double Latitude, double Longitude)?> GeocodeAddressAsync(string address);
    }
}
