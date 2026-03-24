using BE_PetWeb_API.DTOs.Review;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAllReviews()
        {
            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReview(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound("Review not found");
            }

            return Ok(review);
        }

        // GET: api/Reviews/User/5
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByUser(int userId)
        {
            var reviews = await _reviewService.GetReviewsByUserIdAsync(userId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Service/5
        [HttpGet("Service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByService(int serviceId)
        {
            var reviews = await _reviewService.GetReviewsByServiceIdAsync(serviceId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Product/5
        [HttpGet("Product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByProduct(int productId)
        {
            var reviews = await _reviewService.GetReviewsByProductIdAsync(productId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Appointment/5
        [HttpGet("Appointment/{appointmentId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByAppointment(int appointmentId)
        {
            var reviews = await _reviewService.GetReviewsByAppointmentIdAsync(appointmentId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Order/5
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByOrder(int orderId)
        {
            var reviews = await _reviewService.GetReviewsByOrderIdAsync(orderId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Service/5/Rating
        [HttpGet("Service/{serviceId}/Rating")]
        public async Task<ActionResult<double>> GetServiceRating(int serviceId)
        {
            var rating = await _reviewService.GetAverageRatingForServiceAsync(serviceId);
            return Ok(new { AverageRating = rating });
        }

        // GET: api/Reviews/Product/5/Rating
        [HttpGet("Product/{productId}/Rating")]
        public async Task<ActionResult<double>> GetProductRating(int productId)
        {
            var rating = await _reviewService.GetAverageRatingForProductAsync(productId);
            return Ok(new { AverageRating = rating });
        }

        // POST: api/Reviews
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto createReviewDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);
                return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> UpdateReview(int id, UpdateReviewDto updateReviewDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var review = await _reviewService.UpdateReviewAsync(id, userId, updateReviewDto);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _reviewService.DeleteReviewAsync(id, userId);
                if (!result)
                {
                    return NotFound("Review not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new Exception("User ID claim not found");

            return int.Parse(userIdClaim.Value);
        }
    }
}