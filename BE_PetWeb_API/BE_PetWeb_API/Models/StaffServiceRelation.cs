// Trong thư mục Models, tạo hoặc sửa file StaffServiceRelation.cs
namespace BE_PetWeb_API.Models
{
    public class StaffServiceRelation
    {
        public int StaffId { get; set; }
        public int ServiceId { get; set; }

        // Navigation properties
        public Staff Staff { get; set; }
        public Service Service { get; set; }
    }
}