using BE_PetWeb_API.DTOs.Review;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetAllReviewsAsync();
        Task<ReviewDto> GetReviewByIdAsync(int id);
        Task<IEnumerable<ReviewDto>> GetReviewsByUserIdAsync(int userId);
        Task<IEnumerable<ReviewDto>> GetReviewsByServiceIdAsync(int serviceId);
        Task<IEnumerable<ReviewDto>> GetReviewsByProductIdAsync(int productId);
        Task<IEnumerable<ReviewDto>> GetReviewsByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<ReviewDto>> GetReviewsByOrderIdAsync(int orderId);
        Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto createReviewDto);
        Task<ReviewDto> UpdateReviewAsync(int id, int userId, UpdateReviewDto updateReviewDto);
        Task<bool> DeleteReviewAsync(int id, int userId);
        Task<double> GetAverageRatingForServiceAsync(int serviceId);
        Task<double> GetAverageRatingForProductAsync(int productId);
    }
}