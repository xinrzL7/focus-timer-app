namespace ProductivityApp.API.DTOs
{
    public class FocusSessionDto
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
