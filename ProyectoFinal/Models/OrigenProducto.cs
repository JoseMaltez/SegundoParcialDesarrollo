using System.ComponentModel.DataAnnotations;

namespace ProyectoFinal.Models
{
    public class OrigenProducto
    {
        [Key]
        public int IdOrigen { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreOrigen { get; set; } = null!;

        public ICollection<Producto>? Productos { get; set; }

    }
}
