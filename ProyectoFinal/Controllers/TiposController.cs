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

        [HttpPost]
        public async Task<ActionResult<TipoProducto>> Post(TipoProducto tipo)
        {
            _context.TiposProducto.Add(tipo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = tipo.IdTipoProducto }, tipo);
        }
    }
}
