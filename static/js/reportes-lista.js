let reportesData = [];

function limpiarFechaValidador(fecha) {
    if (!fecha) return '-';
    let str = String(fecha).trim();
    if (str.includes('T')) {
        const partes = str.split('T')[0].split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    return str;
}

async function cargarReportes() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('gridReportes');

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getReportsList`);
        const data = await res.json();

        if (data.status !== 'success' || !data.reportes) {
            throw new Error(data.message || "Error al obtener datos");
        }

        reportesData = data.reportes;
        loading.style.display = 'none';

        if (reportesData.length === 0) {
            grid.innerHTML = '<p style="margin-top:20px; text-align: center;">No hay incidencias registradas en Google Sheets.</p>';
            grid.style.display = 'block';
            return;
        }

        grid.innerHTML = reportesData.map(r => `
            <div class="card-reporte" id="card-${r.id}">
                <div class="card-header">
                    <div>
                        <strong>Pallet: ${r.nro_pallet || 'N/A'}</strong>
                        <button onclick="eliminarReporte('${r.id}')" class="btn-danger-sm">🗑️ Borrar</button>
                    </div>
                    <span class="fecha-badge">${r.fecha_registro || ''}</span>
                </div>
                <div class="card-body">
                    <p><strong>Fecha Validador:</strong> ${limpiarFechaValidador(r.fecha_validador)}</p>
                    <p><strong>Auditor:</strong> ${r.auditor || '-'} | <strong>Turno:</strong> ${r.turno || '-'}</p>
                    <p><strong>Tienda:</strong> (${r.cod_tienda || '-'}) ${r.nombre_tienda || ''}</p>
                    <div class="desc-box"><strong>Incidencia:</strong> ${r.descripcion || '-'}</div>
                    <div class="fotos-comparativa">
                        ${r.url_packing ? `<div class="foto-item"><small>Packing</small><img src="${r.url_packing}" class="img-preview" onclick="abrirModal('${r.url_packing}', 'Packing_${r.nro_pallet}.jpg')"></div>` : ''}
                        ${r.url_pallet ? `<div class="foto-item"><small>Pallet</small><img src="${r.url_pallet}" class="img-preview" onclick="abrirModal('${r.url_pallet}', 'Pallet_${r.nro_pallet}.jpg')"></div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        grid.style.display = 'grid';
    } catch (err) {
        console.error("Error al cargar reportes:", err);
        loading.innerText = "⚠️ Error al cargar historial desde Google Sheets.";
    }
}

async function eliminarReporte(id) {
    if (confirm("¿Deseas eliminar este registro de Google Sheets?")) {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=deleteReport&id=${encodeURIComponent(id)}`);
            const result = await res.json();

            if (result.status === 'success') {
                const card = document.getElementById(`card-${id}`);
                if (card) card.remove();
                reportesData = reportesData.filter(r => r.id !== id);
            } else {
                alert("No se pudo eliminar el registro.");
            }
        } catch (e) {
            alert("Error de conexión al intentar eliminar.");
        }
    }
}

function abrirModal(src, titulo) {
    document.getElementById('modalImage').src = src;
    document.getElementById('modalDownload').href = src;
    document.getElementById('modalTitle').innerText = titulo || 'Evidencia.jpg';
    document.getElementById('imageModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function descargarExcel() {
    if (reportesData.length === 0) return alert("Sin datos para exportar");
    const worksheet = XLSX.utils.json_to_sheet(reportesData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidencias");
    XLSX.writeFile(workbook, `Reporte_Incidencias_${Date.now()}.xlsx`);
}

document.addEventListener('DOMContentLoaded', cargarReportes);