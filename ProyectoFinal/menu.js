const API_BASE = 'https://localhost:7288/api';

document.addEventListener('DOMContentLoaded', function() {
    loadSystemSummary();
});

async function loadSystemSummary() {
    try {
        const [productosRes, tiposRes, origenesRes] = await Promise.all([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/tipos`),
            fetch(`${API_BASE}/origenes`)
        ]);

        const productos = await productosRes.json();
        const tipos = await tiposRes.json();
        const origenes = await origenesRes.json();

        const resumen = document.getElementById('resumen');
        resumen.innerHTML = `
            <strong>Resumen del sistema:</strong><br>
            • Productos registrados: ${productos.length}<br>
            • Tipos disponibles: ${tipos.length}<br>
            • Orígenes configurados: ${origenes.length}
        `;

    } catch (err) {
        console.error('Error cargando resumen:', err);
        document.getElementById('resumen').textContent = 'Error cargando información del sistema';
    }
}