using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class UpdateAppointmentStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        /// <summary>Optional; must be nullable so JSON { "notes": null } passes validation with Nullable enabled.</summary>
        public string? Notes { get; set; }
    }
}