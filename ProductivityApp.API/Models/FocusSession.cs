using System.ComponentModel.DataAnnotations.Schema;

namespace ProductivityApp.API.Models
{
    public class FocusSession
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int PlannedMinutes { get; set; }
        public string TypeId { get; set; } = "01";   // 預設為工作

        [ForeignKey("TypeId")]
        public FocusType? Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
    }
}
