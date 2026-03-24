using System;

namespace BE_PetWeb_API.DTOs.Review
{
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public int? ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int? AppointmentId { get; set; }
        public int? OrderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime? ReviewDate { get; set; }
    }
}