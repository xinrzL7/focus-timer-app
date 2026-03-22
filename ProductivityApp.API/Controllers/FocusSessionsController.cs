using Microsoft.AspNetCore.Mvc;
using ProductivityApp.API.Data;
using ProductivityApp.API.Models;
using ProductivityApp.API.DTOs;
using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Services;
using SQLitePCL;


namespace ProductivityApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FocusSessionsController : ControllerBase
    {
        private readonly FocusAnalyticsService _analytics;
        private readonly FocusSessionService _service;
        public FocusSessionsController(FocusAnalyticsService analytics, FocusSessionService service)
        {
            _analytics = analytics;
            _service = service;
        }

        #region 新增session
        [HttpPost]
        public async Task<ActionResult<FocusSession>> CreateSession(CreateFocusSessionDto dto)
        {
            var session = await _service.CreateSession(dto);

            return Ok(session);
        }
        #endregion 新增session

        #region 修改session
        [HttpPut("{id}")]
        public async Task<ActionResult<FocusSession>> UpdateSession(int id, UpdateFocusSessionDto dto)
        {
            var session = await _service.UpdateSession(id, dto);

            if (session == null)
                return NotFound();

            return Ok(session);
        }

        #endregion 修改session

        #region 刪除session
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteSession(id);

            if (!result)
                return NotFound();

            return NoContent();
        }
        #endregion 刪除session

        #region 全部的session
        [HttpGet]
        public async Task<ActionResult<List<FocusSession>>> GetAll()
        {
            var sessions = await _service.GetAllSessions();

            return Ok(sessions);
        }
        #endregion 全部的session

        [HttpGet("running")]
        public async Task<ActionResult<FocusSession?>> GetRunningSession()
        {
            var session = await _service.GetRunningSession();

            if (session == null) return NotFound();

            return Ok(session);
        }

        [HttpPost("start")]
        public async Task<ActionResult<FocusSession>> StartSession([FromBody] StartSessionRequest request)
        {
            var session = await _service.StartSession(request.PlannedMinutes, request.TypeId);
            return Ok(session);
        }

        [HttpPost("stop/{id}")]
        public async Task<ActionResult<FocusSession>> StopSession(int id)
        {
            var session = await _service.StopSession(id);

            if (session == null)
                return NotFound();

            return Ok(session);
        }

        #region 查詢

        [HttpGet("history")]
        public async Task<ActionResult<List<FocusSession>>> GetHistory([FromQuery] DateTime? start, [FromQuery] DateTime? end, [FromQuery] string? typeId)
        {
            var sessions = await _service.GetHistory(start, end, typeId);
            return Ok(sessions);
        }

        #endregion 查詢
    }
}
