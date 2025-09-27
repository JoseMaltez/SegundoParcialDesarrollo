using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoFinal.Models
{
    public class Producto
    {
        [Key]
        public int IdProducto { get; set; }

        [Required]
        [MaxLength(50)]
        public string CodigoProducto { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Descripcion { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Precio { get; set; }

        [Required]
        public int Stock { get; set; }

        [Required]
        public int IdTipoProducto { get; set; }

        [Required]
        public int IdOrigen { get; set; }

        public TipoProducto? TipoProducto { get; set; }
        public OrigenProducto? OrigenProducto { get; set; }
    }
}
