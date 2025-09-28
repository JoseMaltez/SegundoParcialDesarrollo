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

        [HttpGet("{id}")]
        public async Task<ActionResult<OrigenProducto>> Get(int id)
        {
            var origen = await _context.OrigenesProducto.FindAsync(id);
            if (origen == null) return NotFound();
            return origen;
        }

        [HttpPost]
        public async Task<ActionResult<OrigenProducto>> Post(OrigenProducto origen)
        {
            _context.OrigenesProducto.Add(origen);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = origen.IdOrigen }, origen);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, OrigenProducto origen)
        {
            if (id != origen.IdOrigen) return BadRequest();

            _context.Entry(origen).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrigenExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var origen = await _context.OrigenesProducto.FindAsync(id);
            if (origen == null) return NotFound();

            // Verificar si hay productos usando este origen
            var productosConOrigen = await _context.Productos.AnyAsync(p => p.IdOrigen == id);
            if (productosConOrigen)
            {
                return BadRequest(new { message = "No se puede eliminar el origen porque hay productos asociados" });
            }

            _context.OrigenesProducto.Remove(origen);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool OrigenExists(int id) => _context.OrigenesProducto.Any(e => e.IdOrigen == id);
    }
}