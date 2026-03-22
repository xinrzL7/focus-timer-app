using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Data;
using ProductivityApp.API.DTOs;

namespace ProductivityApp.API.Services
{
    public class FocusAnalyticsService
    {
        private readonly AppDbContext _context;
        
        public FocusAnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        #region 本日統計
        public async Task<int> GetTodayMinutes() 
        {
            var today = DateTime.Today;

            return await GetMinutesForDay(today);
        }
        
        #endregion 本日統計

        #region 每週統計
        public async Task<int> GetWeekTotalMinutes()
        {
            var today = DateTime.Today;
            var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = today.AddDays(-diff);

            int total = 0;

            for (int i = 0; i < 7; i++)
            {
                total += await GetMinutesForDay(startOfWeek.AddDays(i));
            }

            return total;
        }
        
        #endregion 每週統計

        #region 每月統計
        public async Task<int> GetMonthTotalMinutes()
        {
            var now = DateTime.Today;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var days = DateTime.DaysInMonth(now.Year, now.Month);

            int total = 0;

            for (int i = 0; i < days; i++)
            {
                total += await GetMinutesForDay(startOfMonth.AddDays(i));
            }

            return total;
        }
        #endregion 每月統計

        #region 每週的每一天統計

        public async Task<List<DailyFocusDto>> GetWeekDailyMinutes()
        {
            var today = DateTime.Today;
            var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = today.AddDays(-diff);

            var result = new List<DailyFocusDto>();

            for (int i = 0; i < 7; i++) 
            {
                var day = startOfWeek.AddDays(i);
                
                result.Add(new DailyFocusDto
                {
                    Day = day.ToString("ddd"),
                    Minutes = await GetMinutesForDay(day)
                });
            }

            return result;
        }

        #endregion 每週的每一天統計

        #region 每日統計

        public async Task<int> GetMinutesForDay(DateTime day)
        {
            var startOfDay = day.Date;
            var endOfDay = startOfDay.AddDays(1);

            var sessions = await _context.FocusSessions
                .Where(s => s.EndTime > startOfDay && s.StartTime < endOfDay)
                .ToListAsync();

            int totalMinutes = 0;

            foreach (var s in sessions)
            {
                var start = s.StartTime < startOfDay ? startOfDay : s.StartTime;
                var end = s.EndTime.Value > endOfDay ? endOfDay : s.EndTime.Value;

                totalMinutes += (int)Math.Round((end - start).TotalMinutes);
            }

            return totalMinutes;
        }

        #endregion 每日統計
    }
}
