using BE_PetWeb_API.DTOs.Service;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDto>> GetAllServicesAsync();
        Task<ServiceDto> GetServiceByIdAsync(int id);
        Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(string category);
        Task<ServiceDto> CreateServiceAsync(CreateServiceDto createServiceDto);
        Task<ServiceDto> UpdateServiceAsync(int id, UpdateServiceDto updateServiceDto);
        Task<bool> DeleteServiceAsync(int id);
    }
}