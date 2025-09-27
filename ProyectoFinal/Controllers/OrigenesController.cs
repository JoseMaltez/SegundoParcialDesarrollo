using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinal.Data;
using ProyectoFinal.Models;

namespace ProyectoFinal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrigenesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public OrigenesController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrigenProducto>>> Get() => await _context.OrigenesProducto.ToListAsync();

        [HttpPost]
        public async Task<ActionResult<OrigenProducto>> Post(OrigenProducto origen)
        {
            _context.OrigenesProducto.Add(origen);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = origen.IdOrigen }, origen);
        }
    }
}
