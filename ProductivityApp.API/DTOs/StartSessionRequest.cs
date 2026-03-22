namespace ProductivityApp.API.DTOs
{
    public class StartSessionRequest
    {
        public int PlannedMinutes { get; set; }
        public string TypeId { get; set; } = "01";
    }
}
