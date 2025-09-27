using System.ComponentModel.DataAnnotations;

namespace ProyectoFinal.Models
{
    public class TipoProducto
    {
        [Key]
        public int IdTipoProducto { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreTipo { get; set; } = null!;

        public ICollection<Producto>? Productos { get; set; }
    }
}
