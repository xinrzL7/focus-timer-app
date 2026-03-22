using Microsoft.AspNetCore.Mvc;
using ProductivityApp.API.Data;
using ProductivityApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductivityApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FocusTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FocusTypesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<FocusType>>> GetAll()
        {
            var types = await _context.FocusTypes.OrderBy(t => t.Id).ToListAsync();
            return Ok(types);
        }

        [HttpPost]
        public async Task<ActionResult<FocusType>> Create(FocusType type)
        {
            _context.FocusTypes.Add(type);
            await _context.SaveChangesAsync();
            return Ok(type);
        }
    }
}
