using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string PaymentMethod { get; set; }

        [Required]
        public List<CreateOrderItemDto> OrderItems { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}