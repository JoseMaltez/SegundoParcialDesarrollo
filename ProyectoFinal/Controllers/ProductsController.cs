using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoFinal.Data;
using ProyectoFinal.Models;

namespace ProyectoFinal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ProductsController(ApplicationDbContext context) 
        { 
            _context = context; 
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> Get()
        {
            return await _context.Productos
                .Include(p => p.TipoProducto)
                .Include(p => p.OrigenProducto)
                .ToListAsync();
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> Get(int id)
        {
            var p = await _context.Productos
                .Include(x => x.TipoProducto)
                .Include(x => x.OrigenProducto)
                .FirstOrDefaultAsync(x => x.IdProducto == id);

            if (p == null) return NotFound();
            return p;
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Producto>> Post(Producto producto)
        {
            if (await _context.Productos.AnyAsync(x => x.CodigoProducto == producto.CodigoProducto))
                return Conflict(new { message = "CodigoProducto ya existe" });

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = producto.IdProducto }, producto);
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Producto producto)
        {
            if (id != producto.IdProducto) return BadRequest();

            var exists = await _context.Productos.AnyAsync(p => p.CodigoProducto == producto.CodigoProducto && p.IdProducto != id);
            if (exists) return Conflict(new { message = "CodigoProducto ya existe" });

            _context.Entry(producto).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.Productos.Any(e => e.IdProducto == id)) return NotFound(); else throw; }

            return NoContent();
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _context.Productos.FindAsync(id);
            if (p == null) return NotFound();
            _context.Productos.Remove(p);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
