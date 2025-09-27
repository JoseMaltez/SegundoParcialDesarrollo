const API_BASE = 'https://localhost:7288/api'; // ajusta puerto si hace falta
const PRODUCTS_API = `${API_BASE}/products`;
const TIPOS_API = `${API_BASE}/tipos`;
const ORIGENES_API = `${API_BASE}/origenes`;

let editingId = null;

document.getElementById('product-form').addEventListener('submit', handleSubmit);
document.getElementById('cancel-btn').addEventListener('click', cancelEdit);

loadSelects();
loadProducts();

async function loadSelects() {
  try {
    const [tiposRes, origenesRes] = await Promise.all([fetch(TIPOS_API), fetch(ORIGENES_API)]);
    const tipos = tiposRes.ok ? await tiposRes.json() : [];
    const origenes = origenesRes.ok ? await origenesRes.json() : [];

    const tipoSelect = document.getElementById('tipo');
    tipos.forEach(t => tipoSelect.insertAdjacentHTML('beforeend', `<option value="${t.idTipoProducto}">${escapeHtml(t.nombreTipo)}</option>`));

    const origenSelect = document.getElementById('origen');
    origenes.forEach(o => origenSelect.insertAdjacentHTML('beforeend', `<option value="${o.idOrigen}">${escapeHtml(o.nombreOrigen)}</option>`));
  } catch (err) {
    alert('Error cargando tipos/orígenes: ' + err.message);
  }
}

async function loadProducts() {
  try {
    showLoading(true);
    const res = await fetch(PRODUCTS_API);
    if(!res.ok) throw new Error('Error al cargar productos');
    const products = await res.json();
    displayProducts(products);
  } catch (err) {
    alert(err.message);
  } finally {
    showLoading(false);
  }
}

function displayProducts(products) {
  const body = document.getElementById('products-body');
  const table = document.getElementById('products-table');

  if (!products.length) {
    body.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay productos</td></tr>';
    table.classList.remove('hidden');
    return;
  }

  body.innerHTML = products.map(p => `
    <tr>
      <td>${escapeHtml(p.codigoProducto)}</td>
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.descripcion)}</td>
      <td>${escapeHtml(p.tipoProducto?.nombreTipo ?? '')}</td>
      <td>${escapeHtml(p.origenProducto?.nombreOrigen ?? '')}</td>
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
  ['err-codigo','err-nombre','err-descripcion','err-precio','err-stock','err-tipo','err-origen'].forEach(id=>{
    document.getElementById(id).textContent = '';
  });
}

function validateForm(data) {
  clearErrors();
  let ok = true;

  if (!data.codigoProducto) { document.getElementById('err-codigo').textContent = 'El código es requerido'; ok = false; }
  if (!data.nombre) { document.getElementById('err-nombre').textContent = 'El nombre es requerido'; ok = false; }
  if (!data.descripcion) { document.getElementById('err-descripcion').textContent = 'La descripción es requerida'; ok = false; }
  if (!(data.precio > 0)) { document.getElementById('err-precio').textContent = 'El precio debe ser mayor a 0'; ok = false; }
  if (!(Number.isInteger(data.stock) && data.stock >= 0)) { document.getElementById('err-stock').textContent = 'El stock debe ser 0 o mayor'; ok = false; }
  if (!data.idTipoProducto) { document.getElementById('err-tipo').textContent = 'Seleccione un tipo'; ok = false; }
  if (!data.idOrigen) { document.getElementById('err-origen').textContent = 'Seleccione un origen'; ok = false; }

  return ok;
}

async function handleSubmit(e) {
  e.preventDefault();
  const data = getFormData();
  if (!validateForm(data)) return;

  try {
    if (editingId) {
      await fetch(`${PRODUCTS_API}/${editingId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          idProducto: editingId,
          codigoProducto: data.codigoProducto,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          stock: data.stock,
          idTipoProducto: data.idTipoProducto,
          idOrigen: data.idOrigen
        })
      }).then(r => { if (!r.ok) return r.json().then(x => { throw new Error(x?.message || 'Error al actualizar'); }); });
    } else {
      await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          codigoProducto: data.codigoProducto,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          stock: data.stock,
          idTipoProducto: data.idTipoProducto,
          idOrigen: data.idOrigen
        })
      }).then(r => { if (!r.ok) return r.json().then(x => { throw new Error(x?.message || 'Error al crear'); }); });
    }

    resetForm();
    await loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

async function editProduct(id) {
  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`);
    if (!res.ok) throw new Error('No se pudo cargar el producto');
    const p = await res.json();
    editingId = p.idProducto;
    document.getElementById('product-id').value = p.idProducto;
    document.getElementById('codigo').value = p.codigoProducto;
    document.getElementById('name').value = p.nombre;
    document.getElementById('description').value = p.descripcion;
    document.getElementById('price').value = p.precio;
    document.getElementById('stock').value = p.stock;
    document.getElementById('tipo').value = p.idTipoProducto;
    document.getElementById('origen').value = p.idOrigen;
    document.getElementById('form-title').textContent = 'Editar Producto';
    document.getElementById('submit-btn').textContent = 'Actualizar';
    document.getElementById('cancel-btn').classList.remove('hidden');
  } catch (err) {
    alert(err.message);
  }
}

function cancelEdit() {
  resetForm();
  editingId = null;
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
  if (!confirm('¿Eliminar producto?')) return;
  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    await loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('products-table').style.display = show ? 'none' : 'table';
}

function escapeHtml(text) {
  if (!text && text !== 0) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
