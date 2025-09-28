const API_BASE = 'https://localhost:7288/api';
const ORIGENES_API = `${API_BASE}/origenes`;

let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('origen-form').addEventListener('submit', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
    
    loadOrigenes();
});

async function loadOrigenes() {
    try {
        showLoading(true);
        const res = await fetch(ORIGENES_API);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const origenes = await res.json();
        displayOrigenes(origenes);
        
    } catch (err) {
        console.error('Error cargando orígenes:', err);
        alert('Error al cargar orígenes: ' + err.message);
    } finally {
        showLoading(false);
    }
}

function displayOrigenes(origenes) {
    const body = document.getElementById('origenes-body');
    const table = document.getElementById('origenes-table');

    if (!origenes || origenes.length === 0) {
        body.innerHTML = '<tr><td colspan="3" style="text-align:center">No hay orígenes registrados</td></tr>';
        table.classList.remove('hidden');
        return;
    }

    body.innerHTML = origenes.map(o => `
        <tr>
            <td>${o.idOrigen}</td>
            <td>${escapeHtml(o.nombreOrigen)}</td>
            <td class="table-actions">
                <button class="btn-warning" onclick="editOrigen(${o.idOrigen})">Editar</button>
                <button class="btn-danger" onclick="deleteOrigen(${o.idOrigen})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    table.classList.remove('hidden');
}

function getFormData() {
    return {
        idOrigen: editingId || 0,
        nombreOrigen: document.getElementById('nombreOrigen').value.trim()
    };
}

function clearErrors() {
    document.getElementById('err-nombreOrigen').textContent = '';
}

function validateForm(data) {
    clearErrors();
    let isValid = true;

    if (!data.nombreOrigen) {
        document.getElementById('err-nombreOrigen').textContent = 'El nombre es requerido';
        isValid = false;
    }

    return isValid;
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = getFormData();
    
    if (!validateForm(data)) return;

    try {
        const url = editingId ? `${ORIGENES_API}/${editingId}` : ORIGENES_API;
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
        await loadOrigenes();
        alert(editingId ? 'Origen actualizado correctamente' : 'Origen creado correctamente');
        
    } catch (err) {
        console.error('Error guardando origen:', err);
        alert('Error: ' + err.message);
    }
}

async function editOrigen(id) {
    try {
        const res = await fetch(`${ORIGENES_API}/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el origen');
        
        const origen = await res.json();
        editingId = origen.idOrigen;
        
        document.getElementById('nombreOrigen').value = origen.nombreOrigen;
        
        document.getElementById('form-title').textContent = 'Editar Origen';
        document.getElementById('submit-btn').textContent = 'Actualizar';
        document.getElementById('cancel-btn').classList.remove('hidden');

    } catch (err) {
        alert('Error al cargar origen: ' + err.message);
    }
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('origen-form').reset();
    clearErrors();
    document.getElementById('form-title').textContent = 'Agregar Origen';
    document.getElementById('submit-btn').textContent = 'Guardar';
    document.getElementById('cancel-btn').classList.add('hidden');
    editingId = null;
}

async function deleteOrigen(id) {
    if (!confirm('¿Está seguro de eliminar este origen? Esto podría afectar productos asociados.')) return;
    
    try {
        const res = await fetch(`${ORIGENES_API}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!res.ok) throw new Error('Error al eliminar origen');
        
        await loadOrigenes();
        alert('Origen eliminado correctamente');
        
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('origenes-table');
    
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

window.editOrigen = editOrigen;
window.deleteOrigen = deleteOrigen;