const API_BASE = 'https://localhost:7288/api';
const TIPOS_API = `${API_BASE}/tipos`;

let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tipo-form').addEventListener('submit', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
    
    loadTipos();
});

async function loadTipos() {
    try {
        showLoading(true);
        const res = await fetch(TIPOS_API);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const tipos = await res.json();
        displayTipos(tipos);
        
    } catch (err) {
        console.error('Error cargando tipos:', err);
        alert('Error al cargar tipos: ' + err.message);
    } finally {
        showLoading(false);
    }
}

function displayTipos(tipos) {
    const body = document.getElementById('tipos-body');
    const table = document.getElementById('tipos-table');

    if (!tipos || tipos.length === 0) {
        body.innerHTML = '<tr><td colspan="3" style="text-align:center">No hay tipos registrados</td></tr>';
        table.classList.remove('hidden');
        return;
    }

    body.innerHTML = tipos.map(t => `
        <tr>
            <td>${t.idTipoProducto}</td>
            <td>${escapeHtml(t.nombreTipo)}</td>
            <td class="table-actions">
                <button class="btn-warning" onclick="editTipo(${t.idTipoProducto})">Editar</button>
                <button class="btn-danger" onclick="deleteTipo(${t.idTipoProducto})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    table.classList.remove('hidden');
}

function getFormData() {
    return {
        idTipoProducto: editingId || 0,
        nombreTipo: document.getElementById('nombreTipo').value.trim()
    };
}

function clearErrors() {
    document.getElementById('err-nombreTipo').textContent = '';
}

function validateForm(data) {
    clearErrors();
    let isValid = true;

    if (!data.nombreTipo) {
        document.getElementById('err-nombreTipo').textContent = 'El nombre es requerido';
        isValid = false;
    }

    return isValid;
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = getFormData();
    
    if (!validateForm(data)) return;

    try {
        const url = editingId ? `${TIPOS_API}/${editingId}` : TIPOS_API;
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
        await loadTipos();
        alert(editingId ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente');
        
    } catch (err) {
        console.error('Error guardando tipo:', err);
        alert('Error: ' + err.message);
    }
}

async function editTipo(id) {
    try {
        const res = await fetch(`${TIPOS_API}/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el tipo');
        
        const tipo = await res.json();
        editingId = tipo.idTipoProducto;
        
        document.getElementById('nombreTipo').value = tipo.nombreTipo;
        
        document.getElementById('form-title').textContent = 'Editar Tipo';
        document.getElementById('submit-btn').textContent = 'Actualizar';
        document.getElementById('cancel-btn').classList.remove('hidden');

    } catch (err) {
        alert('Error al cargar tipo: ' + err.message);
    }
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('tipo-form').reset();
    clearErrors();
    document.getElementById('form-title').textContent = 'Agregar Tipo';
    document.getElementById('submit-btn').textContent = 'Guardar';
    document.getElementById('cancel-btn').classList.add('hidden');
    editingId = null;
}

async function deleteTipo(id) {
    if (!confirm('¿Está seguro de eliminar este tipo? Esto podría afectar productos asociados.')) return;
    
    try {
        const res = await fetch(`${TIPOS_API}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!res.ok) throw new Error('Error al eliminar tipo');
        
        await loadTipos();
        alert('Tipo eliminado correctamente');
        
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('tipos-table');
    
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

window.editTipo = editTipo;
window.deleteTipo = deleteTipo;