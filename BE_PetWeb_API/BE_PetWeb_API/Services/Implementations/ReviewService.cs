using BE_PetWeb_API.DTOs.Review;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ReviewService : IReviewService
    {
        private readonly PetWebContext _context;

        public ReviewService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewDto>> GetAllReviewsAsync()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Service)
                .Include(r => r.Product)
                .Include(r => r.Appointment)
                .Include(r => r.Order)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<ReviewDto> GetReviewByIdAsync(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Service)
                .Include(r => r.Product)
                .Include(r => r.Appointment)
                .Include(r => r.Order)
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
                return null;

            return MapToReviewDto(review);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByUserIdAsync(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Service)
                .Include(r => r.Product)
                .Include(r => r.Appointment)
                .Include(r => r.Order)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByServiceIdAsync(int serviceId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ServiceId == serviceId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByProductIdAsync(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByAppointmentIdAsync(int appointmentId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.AppointmentId == appointmentId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByOrderIdAsync(int orderId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.OrderId == orderId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            return reviews.Select(MapToReviewDto);
        }

        public async Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto createReviewDto)
        {
            ValidateReviewTarget(createReviewDto);

            // Kiểm tra user có tồn tại không
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Kiểm tra đối tượng đánh giá có tồn tại không
            await ValidateReviewTargetExistsAsync(createReviewDto);

            // Kiểm tra xem user đã đánh giá đối tượng này chưa
            await CheckDuplicateReviewAsync(userId, createReviewDto);

            // Tạo đánh giá mới
            var review = new Review
            {
                UserId = userId,
                ServiceId = createReviewDto.ServiceId,
                ProductId = createReviewDto.ProductId,
                AppointmentId = createReviewDto.AppointmentId,
                OrderId = createReviewDto.OrderId,
                Rating = createReviewDto.Rating,
                Comment = createReviewDto.Comment,
                ReviewDate = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Cập nhật đánh giá trung bình cho dịch vụ hoặc sản phẩm
            await UpdateAverageRatingAsync(review);

            return await GetReviewByIdAsync(review.ReviewId);
        }

        public async Task<ReviewDto> UpdateReviewAsync(int id, int userId, UpdateReviewDto updateReviewDto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                throw new Exception("Đánh giá không tồn tại");

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể cập nhật
            if (review.UserId != userId && !await IsAdminUserAsync(userId))
                throw new Exception("Bạn không có quyền cập nhật đánh giá này");

            if (updateReviewDto.Rating.HasValue)
                review.Rating = updateReviewDto.Rating.Value;

            if (!string.IsNullOrEmpty(updateReviewDto.Comment))
                review.Comment = updateReviewDto.Comment;

            _context.Reviews.Update(review);
            await _context.SaveChangesAsync();

            // Cập nhật đánh giá trung bình cho dịch vụ hoặc sản phẩm
            await UpdateAverageRatingAsync(review);

            return await GetReviewByIdAsync(id);
        }

        public async Task<bool> DeleteReviewAsync(int id, int userId)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return false;

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể xóa
            if (review.UserId != userId && !await IsAdminUserAsync(userId))
                throw new Exception("Bạn không có quyền xóa đánh giá này");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Cập nhật đánh giá trung bình cho dịch vụ hoặc sản phẩm
            await UpdateAverageRatingAfterDeleteAsync(review);

            return true;
        }

        public async Task<double> GetAverageRatingForServiceAsync(int serviceId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.ServiceId == serviceId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (!ratings.Any())
                return 0;

            return Math.Round(ratings.Average(), 1);
        }

        public async Task<double> GetAverageRatingForProductAsync(int productId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (!ratings.Any())
                return 0;

            return Math.Round(ratings.Average(), 1);
        }

        #region Helper Methods

        private ReviewDto MapToReviewDto(Review review)
        {
            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                UserId = review.UserId,
                UserName = review.User?.FullName,
                UserAvatar = review.User?.Avatar,
                ServiceId = review.ServiceId,
                ServiceName = review.Service?.Name,
                ProductId = review.ProductId,
                ProductName = review.Product?.Name,
                AppointmentId = review.AppointmentId,
                OrderId = review.OrderId,
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewDate = review.ReviewDate
            };
        }

        private void ValidateReviewTarget(CreateReviewDto createReviewDto)
        {
            // Kiểm tra xem có ít nhất một đối tượng được đánh giá
            if (!createReviewDto.ServiceId.HasValue &&
                !createReviewDto.ProductId.HasValue &&
                !createReviewDto.AppointmentId.HasValue &&
                !createReviewDto.OrderId.HasValue)
            {
                throw new Exception("Phải chọn ít nhất một đối tượng để đánh giá (Dịch vụ, Sản phẩm, Lịch hẹn hoặc Đơn hàng)");
            }

            // Kiểm tra xem không đánh giá nhiều hơn một đối tượng
            int count = 0;
            if (createReviewDto.ServiceId.HasValue) count++;
            if (createReviewDto.ProductId.HasValue) count++;
            if (createReviewDto.AppointmentId.HasValue) count++;
            if (createReviewDto.OrderId.HasValue) count++;

            if (count > 1)
            {
                throw new Exception("Chỉ có thể đánh giá một đối tượng tại một thời điểm");
            }
        }

        private async Task ValidateReviewTargetExistsAsync(CreateReviewDto createReviewDto)
        {
            if (createReviewDto.ServiceId.HasValue)
            {
                var service = await _context.Services.FindAsync(createReviewDto.ServiceId.Value);
                if (service == null)
                    throw new Exception("Dịch vụ không tồn tại");
            }
            else if (createReviewDto.ProductId.HasValue)
            {
                var product = await _context.Products.FindAsync(createReviewDto.ProductId.Value);
                if (product == null)
                    throw new Exception("Sản phẩm không tồn tại");
            }
            else if (createReviewDto.AppointmentId.HasValue)
            {
                var appointment = await _context.Appointments.FindAsync(createReviewDto.AppointmentId.Value);
                if (appointment == null)
                    throw new Exception("Lịch hẹn không tồn tại");
            }
            else if (createReviewDto.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(createReviewDto.OrderId.Value);
                if (order == null)
                    throw new Exception("Đơn hàng không tồn tại");
            }
        }

        private async Task CheckDuplicateReviewAsync(int userId, CreateReviewDto createReviewDto)
        {
            bool exists = false;

            if (createReviewDto.ServiceId.HasValue)
            {
                exists = await _context.Reviews
                    .AnyAsync(r => r.UserId == userId && r.ServiceId == createReviewDto.ServiceId.Value);

                if (exists)
                    throw new Exception("Bạn đã đánh giá dịch vụ này rồi");
            }
            else if (createReviewDto.ProductId.HasValue)
            {
                exists = await _context.Reviews
                    .AnyAsync(r => r.UserId == userId && r.ProductId == createReviewDto.ProductId.Value);

                if (exists)
                    throw new Exception("Bạn đã đánh giá sản phẩm này rồi");
            }
            else if (createReviewDto.AppointmentId.HasValue)
            {
                exists = await _context.Reviews
                    .AnyAsync(r => r.UserId == userId && r.AppointmentId == createReviewDto.AppointmentId.Value);

                if (exists)
                    throw new Exception("Bạn đã đánh giá lịch hẹn này rồi");
            }
            else if (createReviewDto.OrderId.HasValue)
            {
                exists = await _context.Reviews
                    .AnyAsync(r => r.UserId == userId && r.OrderId == createReviewDto.OrderId.Value);

                if (exists)
                    throw new Exception("Bạn đã đánh giá đơn hàng này rồi");
            }
        }

        private async Task UpdateAverageRatingAsync(Review review)
        {
            if (review.ServiceId.HasValue)
            {
                var service = await _context.Services.FindAsync(review.ServiceId.Value);
                if (service != null)
                {
                    var avgRating = await GetAverageRatingForServiceAsync(review.ServiceId.Value);
                    // Cập nhật trường Rating trong Service (nếu có)
                    // Ví dụ: service.Rating = avgRating;
                    // _context.Services.Update(service);
                    // await _context.SaveChangesAsync();
                }
            }
            else if (review.ProductId.HasValue)
            {
                var product = await _context.Products.FindAsync(review.ProductId.Value);
                if (product != null)
                {
                    var avgRating = await GetAverageRatingForProductAsync(review.ProductId.Value);
                    // Cập nhật trường Rating trong Product (nếu có)
                    // Ví dụ: product.Rating = avgRating;
                    // _context.Products.Update(product);
                    // await _context.SaveChangesAsync();
                }
            }
        }

        private async Task UpdateAverageRatingAfterDeleteAsync(Review review)
        {
            await UpdateAverageRatingAsync(review);
        }

        private async Task<bool> IsAdminUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && user.Role == "Admin";
        }

        #endregion
    }
}