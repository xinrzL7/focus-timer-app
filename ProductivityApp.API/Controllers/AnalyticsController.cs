using Microsoft.AspNetCore.Mvc;
using ProductivityApp.API.DTOs;
using ProductivityApp.API.Services;

namespace ProductivityApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly FocusAnalyticsService _analytics;
        public AnalyticsController(FocusAnalyticsService analytics)
        {
            _analytics = analytics;
        }

        #region 今日統計
        [HttpGet("today")]
        public async Task<ActionResult<int>> GetTodayMinutes()
        {
            var minutes = await _analytics.GetTodayMinutes();

            return Ok(minutes);
        }
        #endregion 今日統計

        #region 本週統計
        [HttpGet("week")]
        public async Task<ActionResult<int>> GetWeekTotal()
        {
            var minutes = await _analytics.GetWeekTotalMinutes();

            return Ok(minutes);
        }
        #endregion 本週統計

        #region 本月統計
        [HttpGet("month")]
        public async Task<ActionResult<int>> GetMonthTotal()
        {
            var minutes = await _analytics.GetMonthTotalMinutes();

            return Ok(minutes);
        }
        #endregion 本月統計

        #region 每週的每一天統計

        [HttpGet("week-daily")]
        public async Task<ActionResult<List<DailyFocusDto>>> GetWeekDailyMinutes()
        {
            var result = await _analytics.GetWeekDailyMinutes();
            return Ok(result);
        }

        #endregion 每週的每一天統計
    }
}
