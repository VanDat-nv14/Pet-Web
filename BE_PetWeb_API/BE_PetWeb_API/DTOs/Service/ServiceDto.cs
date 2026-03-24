namespace BE_PetWeb_API.DTOs.Service
{
    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string Category { get; set; }
        public string Photo { get; set; }
        public bool? IsActive { get; set; }
    }
}
