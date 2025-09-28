const API_BASE = 'https://localhost:7288/api';
const PRODUCTS_API = `${API_BASE}/products`;
const TIPOS_API = `${API_BASE}/tipos`;
const ORIGENES_API = `${API_BASE}/origenes`;

let editingId = null;


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('product-form').addEventListener('submit', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
    
    loadSelects();
    loadProducts();
});

async function loadSelects() {
    try {
        console.log('Cargando tipos y orígenes...');
        
        const [tiposRes, origenesRes] = await Promise.all([
            fetch(TIPOS_API), 
            fetch(ORIGENES_API)
        ]);
        
        if (!tiposRes.ok) throw new Error(`Error tipos: ${tiposRes.status}`);
        if (!origenesRes.ok) throw new Error(`Error orígenes: ${origenesRes.status}`);
        
        const tipos = await tiposRes.json();
        const origenes = await origenesRes.json();
        
        console.log('Tipos cargados:', tipos);
        console.log('Orígenes cargados:', origenes);

        const tipoSelect = document.getElementById('tipo');
        const origenSelect = document.getElementById('origen');
        
        tipoSelect.innerHTML = '<option value="">-- Seleccione --</option>';
        origenSelect.innerHTML = '<option value="">-- Seleccione --</option>';
        
        tipos.forEach(t => {
            const option = document.createElement('option');
            option.value = t.idTipoProducto;
            option.textContent = t.nombreTipo;
            tipoSelect.appendChild(option);
        });
        
        origenes.forEach(o => {
            const option = document.createElement('option');
            option.value = o.idOrigen;
            option.textContent = o.nombreOrigen;
            origenSelect.appendChild(option);
        });
        
    } catch (err) {
        console.error('Error cargando selects:', err);
        alert('Error cargando tipos/orígenes: ' + err.message);
    }
}

async function loadProducts() {
    try {
        showLoading(true);
        console.log('Cargando productos desde:', PRODUCTS_API);
        
        const res = await fetch(PRODUCTS_API);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const products = await res.json();
        console.log('Productos cargados:', products);
        displayProducts(products);
        
    } catch (err) {
        console.error('Error cargando productos:', err);
        alert('Error al cargar productos: ' + err.message);
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const body = document.getElementById('products-body');
    const table = document.getElementById('products-table');

    if (!products || products.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay productos registrados</td></tr>';
        table.classList.remove('hidden');
        return;
    }

    body.innerHTML = products.map(p => `
        <tr>
            <td>${escapeHtml(p.codigoProducto)}</td>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${escapeHtml(p.descripcion)}</td>
            <td>${escapeHtml(p.tipoProducto?.nombreTipo || 'N/A')}</td>
            <td>${escapeHtml(p.origenProducto?.nombreOrigen || 'N/A')}</td>
            <td>Q${parseFloat(p.precio).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="editProduct(${p.idProducto})">Editar</button>
                <button onclick="deleteProduct(${p.idProducto})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    table.classList.remove('hidden');
}

function getFormData() {
    return {
        idProducto: editingId || 0,
        codigoProducto: document.getElementById('codigo').value.trim(),
        nombre: document.getElementById('name').value.trim(),
        descripcion: document.getElementById('description').value.trim(),
        precio: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        idTipoProducto: parseInt(document.getElementById('tipo').value),
        idOrigen: parseInt(document.getElementById('origen').value)
    };
}

function clearErrors() {
    const errorIds = ['err-codigo', 'err-nombre', 'err-descripcion', 'err-precio', 'err-stock', 'err-tipo', 'err-origen'];
    errorIds.forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

function validateForm(data) {
    clearErrors();
    let isValid = true;

    if (!data.codigoProducto) {
        document.getElementById('err-codigo').textContent = 'El código es requerido';
        isValid = false;
    }
    if (!data.nombre) {
        document.getElementById('err-nombre').textContent = 'El nombre es requerido';
        isValid = false;
    }
    if (!data.descripcion) {
        document.getElementById('err-descripcion').textContent = 'La descripción es requerida';
        isValid = false;
    }
    if (isNaN(data.precio) || data.precio <= 0) {
        document.getElementById('err-precio').textContent = 'El precio debe ser mayor a 0';
        isValid = false;
    }
    if (isNaN(data.stock) || data.stock < 0) {
        document.getElementById('err-stock').textContent = 'El stock debe ser 0 o mayor';
        isValid = false;
    }
    if (!data.idTipoProducto) {
        document.getElementById('err-tipo').textContent = 'Seleccione un tipo';
        isValid = false;
    }
    if (!data.idOrigen) {
        document.getElementById('err-origen').textContent = 'Seleccione un origen';
        isValid = false;
    }

    return isValid;
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = getFormData();
    
    if (!validateForm(data)) return;

    try {
        const url = editingId ? `${PRODUCTS_API}/${editingId}` : PRODUCTS_API;
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        resetForm();
        await loadProducts();
        alert(editingId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        
    } catch (err) {
        console.error('Error guardando producto:', err);
        alert('Error: ' + err.message);
    }
}

async function editProduct(id) {
    try {
        const res = await fetch(`${PRODUCTS_API}/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el producto');
        
        const producto = await res.json();
        editingId = producto.idProducto;
        
        document.getElementById('codigo').value = producto.codigoProducto;
        document.getElementById('name').value = producto.nombre;
        document.getElementById('description').value = producto.descripcion;
        document.getElementById('price').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('tipo').value = producto.idTipoProducto;
        document.getElementById('origen').value = producto.idOrigen;
        
        document.getElementById('form-title').textContent = 'Editar Producto';
        document.getElementById('submit-btn').textContent = 'Actualizar';
        document.getElementById('cancel-btn').classList.remove('hidden');

        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        
    } catch (err) {
        alert('Error al cargar producto: ' + err.message);
    }
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('product-form').reset();
    clearErrors();
    document.getElementById('form-title').textContent = 'Agregar Producto';
    document.getElementById('submit-btn').textContent = 'Guardar';
    document.getElementById('cancel-btn').classList.add('hidden');
    editingId = null;
}

async function deleteProduct(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;
    
    try {
        const res = await fetch(`${PRODUCTS_API}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!res.ok) throw new Error('Error al eliminar producto');
        
        await loadProducts();
        alert('Producto eliminado correctamente');
        
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('products-table');
    
    if (show) {
        loading.style.display = 'block';
        table.style.display = 'none';
    } else {
        loading.style.display = 'none';
        table.style.display = 'table';
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;