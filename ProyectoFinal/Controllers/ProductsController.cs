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
        public async Task<ActionResult<IEnumerable<object>>> Get()
        {
            try
            {
                var productos = await _context.Productos
                    .Include(p => p.TipoProducto)
                    .Include(p => p.OrigenProducto)
                    .Select(p => new
                    {
                        idProducto = p.IdProducto,
                        codigoProducto = p.CodigoProducto,
                        nombre = p.Nombre,
                        descripcion = p.Descripcion,
                        precio = p.Precio,
                        stock = p.Stock,
                        idTipoProducto = p.IdTipoProducto,
                        idOrigen = p.IdOrigen,
                        tipoProducto = p.TipoProducto != null ? new { idTipoProducto = p.TipoProducto.IdTipoProducto, nombreTipo = p.TipoProducto.NombreTipo } : null,
                        origenProducto = p.OrigenProducto != null ? new { idOrigen = p.OrigenProducto.IdOrigen, nombreOrigen = p.OrigenProducto.NombreOrigen } : null
                    })
                    .ToListAsync();

                return Ok(productos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> Get(int id)
        {
            try
            {
                var producto = await _context.Productos
                    .Include(p => p.TipoProducto)
                    .Include(p => p.OrigenProducto)
                    .Where(p => p.IdProducto == id)
                    .Select(p => new
                    {
                        idProducto = p.IdProducto,
                        codigoProducto = p.CodigoProducto,
                        nombre = p.Nombre,
                        descripcion = p.Descripcion,
                        precio = p.Precio,
                        stock = p.Stock,
                        idTipoProducto = p.IdTipoProducto,
                        idOrigen = p.IdOrigen,
                        tipoProducto = p.TipoProducto != null ? new { idTipoProducto = p.TipoProducto.IdTipoProducto, nombreTipo = p.TipoProducto.NombreTipo } : null,
                        origenProducto = p.OrigenProducto != null ? new { idOrigen = p.OrigenProducto.IdOrigen, nombreOrigen = p.OrigenProducto.NombreOrigen } : null
                    })
                    .FirstOrDefaultAsync();

                if (producto == null)
                    return NotFound(new { message = "Producto no encontrado" });

                return Ok(producto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Producto>> Post(Producto producto)
        {
            try
            {
                // Validar que el código no exista
                if (await _context.Productos.AnyAsync(x => x.CodigoProducto == producto.CodigoProducto))
                    return Conflict(new { message = "El código de producto ya existe" });

                // Validar que el tipo y origen existan
                if (!await _context.TiposProducto.AnyAsync(t => t.IdTipoProducto == producto.IdTipoProducto))
                    return BadRequest(new { message = "El tipo de producto no existe" });

                if (!await _context.OrigenesProducto.AnyAsync(o => o.IdOrigen == producto.IdOrigen))
                    return BadRequest(new { message = "El origen no existe" });

                _context.Productos.Add(producto);
                await _context.SaveChangesAsync();

                // Devolver el producto creado con los datos relacionados
                var productoConRelaciones = await _context.Productos
                    .Include(p => p.TipoProducto)
                    .Include(p => p.OrigenProducto)
                    .Where(p => p.IdProducto == producto.IdProducto)
                    .Select(p => new
                    {
                        idProducto = p.IdProducto,
                        codigoProducto = p.CodigoProducto,
                        nombre = p.Nombre,
                        descripcion = p.Descripcion,
                        precio = p.Precio,
                        stock = p.Stock,
                        idTipoProducto = p.IdTipoProducto,
                        idOrigen = p.IdOrigen,
                        tipoProducto = p.TipoProducto != null ? new { idTipoProducto = p.TipoProducto.IdTipoProducto, nombreTipo = p.TipoProducto.NombreTipo } : null,
                        origenProducto = p.OrigenProducto != null ? new { idOrigen = p.OrigenProducto.IdOrigen, nombreOrigen = p.OrigenProducto.NombreOrigen } : null
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(Get), new { id = producto.IdProducto }, productoConRelaciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el producto", error = ex.Message });
            }
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Producto producto)
        {
            try
            {
                if (id != producto.IdProducto)
                    return BadRequest(new { message = "ID del producto no coincide" });

                // Verificar si el producto existe
                var productoExistente = await _context.Productos.FindAsync(id);
                if (productoExistente == null)
                    return NotFound(new { message = "Producto no encontrado" });

                // Validar que el código no exista en otro producto
                if (await _context.Productos.AnyAsync(p => p.CodigoProducto == producto.CodigoProducto && p.IdProducto != id))
                    return Conflict(new { message = "El código de producto ya existe en otro producto" });

                // Validar que el tipo y origen existan
                if (!await _context.TiposProducto.AnyAsync(t => t.IdTipoProducto == producto.IdTipoProducto))
                    return BadRequest(new { message = "El tipo de producto no existe" });

                if (!await _context.OrigenesProducto.AnyAsync(o => o.IdOrigen == producto.IdOrigen))
                    return BadRequest(new { message = "El origen no existe" });

                // Actualizar propiedades
                productoExistente.CodigoProducto = producto.CodigoProducto;
                productoExistente.Nombre = producto.Nombre;
                productoExistente.Descripcion = producto.Descripcion;
                productoExistente.Precio = producto.Precio;
                productoExistente.Stock = producto.Stock;
                productoExistente.IdTipoProducto = producto.IdTipoProducto;
                productoExistente.IdOrigen = producto.IdOrigen;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Productos.Any(e => e.IdProducto == id))
                    return NotFound(new { message = "Producto no encontrado" });
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el producto", error = ex.Message });
            }
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var producto = await _context.Productos.FindAsync(id);
                if (producto == null)
                    return NotFound(new { message = "Producto no encontrado" });

                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el producto", error = ex.Message });
            }
        }
    }
}