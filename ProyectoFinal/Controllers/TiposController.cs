using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinal.Data;
using ProyectoFinal.Models;

namespace ProyectoFinal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiposController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TiposController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoProducto>>> Get() => await _context.TiposProducto.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoProducto>> Get(int id)
        {
            var tipo = await _context.TiposProducto.FindAsync(id);
            if (tipo == null) return NotFound();
            return tipo;
        }

        [HttpPost]
        public async Task<ActionResult<TipoProducto>> Post(TipoProducto tipo)
        {
            _context.TiposProducto.Add(tipo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = tipo.IdTipoProducto }, tipo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, TipoProducto tipo)
        {
            if (id != tipo.IdTipoProducto) return BadRequest();

            _context.Entry(tipo).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tipo = await _context.TiposProducto.FindAsync(id);
            if (tipo == null) return NotFound();

            // Verificar si hay productos usando este tipo
            var productosConTipo = await _context.Productos.AnyAsync(p => p.IdTipoProducto == id);
            if (productosConTipo)
            {
                return BadRequest(new { message = "No se puede eliminar el tipo porque hay productos asociados" });
            }

            _context.TiposProducto.Remove(tipo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool TipoExists(int id) => _context.TiposProducto.Any(e => e.IdTipoProducto == id);
    }
}