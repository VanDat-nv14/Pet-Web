using System;
using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Order
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; } // Giữ là non-nullable trong DTO
        public DateTime? UpdatedAt { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
    }
}