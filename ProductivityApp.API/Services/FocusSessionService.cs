using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Data;
using ProductivityApp.API.DTOs;
using ProductivityApp.API.Models;

namespace ProductivityApp.API.Services
{
    public class FocusSessionService
    {
        private readonly Data.AppDbContext _context;
        public FocusSessionService(AppDbContext context)
        {
            _context = context;
        }


        #region 新增時段

        public async Task<FocusSession> CreateSession(CreateFocusSessionDto dto)
        {
            if (dto.EndTime <= dto.StartTime)
                throw new Exception("EndTime must be greater than StartTime.");

            // 檢查是否有重疊
            var hasOverlap = await _context.FocusSessions
                .AnyAsync(s => (dto.StartTime < s.EndTime && dto.EndTime > s.StartTime)
            );

            if (hasOverlap)
                throw new Exception("Focus session time overlaps.");

            var session = new FocusSession
            {
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                DurationMinutes = (int)Math.Round((dto.EndTime - dto.StartTime).TotalMinutes),
                CreatedAt = DateTime.UtcNow
            };

            _context.FocusSessions.Add(session);
            await _context.SaveChangesAsync();

            return session;
        }

        #endregion 新增時段

        #region 取得全部時段

        public async Task<List<FocusSession>> GetAllSessions()
        {
            return await _context.FocusSessions
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
        }

        #endregion 取得全部時段

        #region 刪除時段

        public async Task<bool> DeleteSession(int id)
        {
            var session = await _context.FocusSessions.FindAsync(id);

            if (session == null)
                return false;

            _context.FocusSessions.Remove(session);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion 刪除時段

        #region 更新時段

        public async Task<FocusSession?> UpdateSession(int id, UpdateFocusSessionDto dto)
        {
            var session = await _context.FocusSessions.FindAsync(id);

            if (session == null)
                return null;

            if (dto.EndTime <= dto.StartTime)
                throw new Exception("EndTime must be greater than StartTime.");

            // 檢查是否與其他session重疊（排除當前 session）
            var overlap = await _context.FocusSessions
                .AnyAsync(s =>
                s.Id != id &&
                dto.StartTime < s.EndTime &&
                dto.EndTime > s.StartTime
            );

            if (overlap)
                throw new Exception("Focus session time overlaps.");

            session.StartTime = dto.StartTime;
            session.EndTime = dto.EndTime;
            session.DurationMinutes = (int)Math.Round((dto.EndTime - dto.StartTime).TotalMinutes);

            await _context.SaveChangesAsync();

            return session;
        }

        #endregion 更新時段

        #region 取得今日專注時間

        public async Task<int> GetTodayFocusMinutes(int id)
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            return await _context.FocusSessions
                .Where(s =>
                    s.StartTime >= today &&
                    s.StartTime < tomorrow &&
                    s.EndTime != null
                )
                .SumAsync(s => s.DurationMinutes);
        }

        #endregion 取得今日專注時間

        #region 取得正在執行的時段

        public async Task<FocusSession?> GetRunningSession()
        {
            return await _context.FocusSessions
                .Where(s => s.EndTime == null)
                .FirstOrDefaultAsync();
        }

        #endregion 取得正在執行的時段

        #region 時段開始

        public async Task<FocusSession> StartSession(int plannedMinutes, string typeId)
        {
            var running = await _context.FocusSessions
                .FirstOrDefaultAsync(s => s.EndTime == null);

            if (running != null) 
                throw new Exception("A focus session is already running.");

            var session = new FocusSession
            {
                StartTime = DateTime.UtcNow,
                EndTime = null,
                CreatedAt = DateTime.Today,
                PlannedMinutes = plannedMinutes,
                TypeId = typeId
            };

            _context.FocusSessions.Add(session);
            await _context.SaveChangesAsync();

            return session;
        }

        #endregion 時段開始

        #region 時段結束

        public async Task<FocusSession?> StopSession(int id)
        {
            var session = await _context.FocusSessions.FindAsync(id);

            if (session == null)
                return null;

            session.EndTime = DateTime.UtcNow;

            var duration = session.EndTime.Value - session.StartTime;

            session.DurationMinutes = (int)Math.Round(duration.TotalMinutes);

            await _context.SaveChangesAsync();

            return session;
        }

        #endregion 時段結束

        #region 查詢

        public async Task<List<FocusSession>> GetHistory(DateTime? start, DateTime? end, string? typeId)
        {
            var query = _context.FocusSessions.AsQueryable();

            if (start.HasValue)
            {
                var startUtc = DateTime.SpecifyKind(start.Value, DateTimeKind.Local).ToUniversalTime();
                query = query.Where(s => s.StartTime >= startUtc);
            }
            if (end.HasValue)
            {
                var endUtc = DateTime.SpecifyKind(end.Value, DateTimeKind.Local)
                    .AddDays(1)
                    .ToUniversalTime();

                query = query.Where(s => s.StartTime < endUtc);
            }

            if (!string.IsNullOrEmpty(typeId))
                query = query.Where(s => s.TypeId == typeId);

            return await query
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
        }

        #endregion 查詢
    }
}
