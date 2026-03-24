using BE_PetWeb_API.DTOs.Service;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ServiceService : IServiceService
    {
        private readonly PetWebContext _context;
        private readonly IFileService _fileService;

        public ServiceService(PetWebContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllServicesAsync()
        {
            var services = await _context.Services
                .Where(s => s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive
                })
                .ToListAsync();

            return services;
        }

        public async Task<ServiceDto> GetServiceByIdAsync(int id)
        {
            var service = await _context.Services
                .Where(s => s.ServiceId == id && s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive
                })
                .FirstOrDefaultAsync();

            return service;
        }

        public async Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(string category)
        {
            var services = await _context.Services
                .Where(s => s.Category == category && s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive
                })
                .ToListAsync();

            return services;
        }

        public async Task<ServiceDto> CreateServiceAsync(CreateServiceDto createServiceDto)
        {
            var service = new Service
            {
                Name = createServiceDto.Name,
                Description = createServiceDto.Description,
                Price = createServiceDto.Price,
                Duration = createServiceDto.Duration,
                Category = createServiceDto.Category,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true,
                BookingCount = 0,
                ViewCount = 0,
                Photo = string.Empty
            };

            if (createServiceDto.Photo is { Length: > 0 })
            {
                try
                {
                    var path = await _fileService.UploadImageAsync(createServiceDto.Photo, "services");
                    if (!string.IsNullOrEmpty(path))
                        service.Photo = path;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to upload image: {ex.Message}");
                }
            }

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Duration = service.Duration,
                Category = service.Category,
                Photo = service.Photo,
                IsActive = service.IsActive
            };
        }

        public async Task<ServiceDto> UpdateServiceAsync(int id, UpdateServiceDto updateServiceDto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
                return null;

            service.Name = updateServiceDto.Name;
            service.Description = updateServiceDto.Description;
            service.Price = updateServiceDto.Price;
            service.Duration = updateServiceDto.Duration;
            service.Category = updateServiceDto.Category;
            service.UpdatedAt = DateTime.Now;

            if (updateServiceDto.Photo is { Length: > 0 })
            {
                try
                {
                    if (!string.IsNullOrEmpty(service.Photo))
                        _fileService.DeleteImage(service.Photo);

                    var path = await _fileService.UploadImageAsync(updateServiceDto.Photo, "services");
                    if (!string.IsNullOrEmpty(path))
                        service.Photo = path;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to upload image: {ex.Message}");
                }
            }

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Duration = service.Duration,
                Category = service.Category,
                Photo = service.Photo,
                IsActive = service.IsActive
            };
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
                return false;

            // Check if service is being used in appointments
            bool isUsed = await _context.Appointments.AnyAsync(a => a.ServiceId == id && a.Status != "Cancelled");
            if (isUsed)
            {
                throw new Exception("Cannot delete service as it is currently being used in appointments");
            }

            // Soft delete
            service.IsActive = false;
            service.UpdatedAt = DateTime.Now;

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}