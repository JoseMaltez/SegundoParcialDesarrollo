using Microsoft.EntityFrameworkCore;
using ProyectoFinal.Models;

namespace ProyectoFinal.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Producto> Productos { get; set; } = null!;
        public DbSet<TipoProducto> TiposProducto { get; set; } = null!;
        public DbSet<OrigenProducto> OrigenesProducto { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Producto>()
                .HasIndex(p => p.CodigoProducto)
                .IsUnique();

            modelBuilder.Entity<Producto>()
                .HasOne(p => p.TipoProducto)
                .WithMany(t => t.Productos)
                .HasForeignKey(p => p.IdTipoProducto)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Producto>()
                .HasOne(p => p.OrigenProducto)
                .WithMany(o => o.Productos)
                .HasForeignKey(p => p.IdOrigen)
                .OnDelete(DeleteBehavior.Restrict);
        }
       }
}
