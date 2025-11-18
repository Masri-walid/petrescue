using AutoMapper;
using PetRescueConnect.API.DTOs;
using PetRescueConnect.API.Models;
using System.Text.Json;

namespace PetRescueConnect.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.MapFrom(src => src.ComputedProfileImageUrl))
                .ForMember(dest => dest.HasProfileImageData, opt => opt.MapFrom(src => src.ProfileImageData != null));
            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // UserPhoto mappings
            CreateMap<UserPhoto, UserPhotoDto>();
            CreateMap<CreateUserPhotoDto, UserPhoto>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
            CreateMap<UpdateUserPhotoDto, UserPhoto>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Organization mappings
            CreateMap<Organization, OrganizationDto>()
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating > 0 ? (double?)src.Rating : null));
            CreateMap<CreateOrganizationDto, Organization>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateOrganizationDto, Organization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Organization Hours mappings
            CreateMap<OrganizationHour, OrganizationHourDto>()
                .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => GetDayOfWeekName(src.DayOfWeek)))
                .ForMember(dest => dest.OpenTime, opt => opt.MapFrom(src => src.OpenTime.HasValue ? src.OpenTime.Value.ToString("HH:mm") : null))
                .ForMember(dest => dest.CloseTime, opt => opt.MapFrom(src => src.CloseTime.HasValue ? src.CloseTime.Value.ToString("HH:mm") : null));

            // Organization Services mappings
            CreateMap<OrganizationService, OrganizationServiceDto>();

            // Animal mappings
            CreateMap<Animal, AnimalDto>();
            CreateMap<CreateAnimalDto, Animal>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateAnimalDto, Animal>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Animal Photo mappings
            CreateMap<AnimalPhoto, AnimalPhotoDto>();

            // Rescue Report mappings
            CreateMap<RescueReport, RescueReportDto>();
            CreateMap<CreateRescueReportDto, RescueReport>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "reported"))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateRescueReportDto, RescueReport>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Rescue Report Photo mappings
            CreateMap<RescueReportPhoto, RescueReportPhotoDto>();

            // Adoption Application mappings
            CreateMap<AdoptionApplication, AdoptionApplicationDto>()
                .ForMember(dest => dest.ApplicationData, opt => opt.MapFrom(src => src.ApplicationData));
            CreateMap<CreateAdoptionApplicationDto, AdoptionApplication>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ApplicationData, opt => opt.MapFrom<ApplicationDataResolver>())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "submitted"))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateAdoptionApplicationDto, AdoptionApplication>()
                .ForMember(dest => dest.ApplicationData, opt => opt.MapFrom<UpdateApplicationDataResolver>())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<ReviewAdoptionApplicationDto, AdoptionApplication>()
                .ForMember(dest => dest.ReviewedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }

        private static string GetDayOfWeekName(int dayOfWeek)
        {
            return dayOfWeek switch
            {
                0 => "Sunday",
                1 => "Monday",
                2 => "Tuesday",
                3 => "Wednesday",
                4 => "Thursday",
                5 => "Friday",
                6 => "Saturday",
                _ => "Unknown"
            };
        }
    }

    public class ApplicationDataResolver : IValueResolver<CreateAdoptionApplicationDto, AdoptionApplication, string>
    {
        public string Resolve(CreateAdoptionApplicationDto source, AdoptionApplication destination, string destMember, ResolutionContext context)
        {
            return JsonSerializer.Serialize(source.ApplicationData);
        }
    }

    public class UpdateApplicationDataResolver : IValueResolver<UpdateAdoptionApplicationDto, AdoptionApplication, string>
    {
        public string Resolve(UpdateAdoptionApplicationDto source, AdoptionApplication destination, string destMember, ResolutionContext context)
        {
            return source.ApplicationData != null ? JsonSerializer.Serialize(source.ApplicationData) : destination.ApplicationData;
        }
    }
}
