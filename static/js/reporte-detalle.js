function limpiarFechaValidador(fecha) {
    if (!fecha) return '-';
    let str = String(fecha).trim();
    if (str.includes('T')) {
        const soloFecha = str.split('T')[0]; 
        const partes = soloFecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    return str;
}

async function cargarReporte() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const dataParam = params.get('data');

    // 1. Mostrar datos de texto al instante desde la URL
    if (dataParam) {
        try {
            const r = JSON.parse(decodeURIComponent(dataParam));
            
            document.getElementById('fecha_reporte').innerText = new Date().toLocaleString('es-PE');
            document.getElementById('fecha_validador').innerText = limpiarFechaValidador(r.fecha_validador);
            document.getElementById('auditor').innerText = r.auditor || '-';
            document.getElementById('turno').innerText = r.turno || '-';
            document.getElementById('nro_pallet').innerText = r.nro_pallet || '-';
            document.getElementById('cod_tienda').innerText = r.cod_tienda || '-';
            document.getElementById('nombre_tienda').innerText = r.nombre_tienda || '-';
            document.getElementById('origen').innerText = 'CD MASS TRUJILLO';
            document.getElementById('descripcion').innerText = r.descripcion || '-';
        } catch (e) {
            console.error("Error al leer datos de la URL, consultando Google...", e);
        }
    }

    // 2. Si existe un ID, conectarse a Google Sheets para descargar las imágenes (Se eliminó el return previo)
    if (idParam) {
        try {
            let url = `${GOOGLE_SCRIPT_URL}?action=getReport&id=${encodeURIComponent(idParam)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status === 'success' && data.reporte) {
                const r = data.reporte;

                // Si por algún motivo no había datos en la URL, llenamos el texto aquí también
                if (!dataParam) {
                    document.getElementById('fecha_reporte').innerText = r.fecha_registro || '-';
                    document.getElementById('fecha_validador').innerText = limpiarFechaValidador(r.fecha_validador);
                    document.getElementById('auditor').innerText = r.auditor || '-';
                    document.getElementById('turno').innerText = r.turno || '-';
                    document.getElementById('nro_pallet').innerText = r.nro_pallet || '-';
                    document.getElementById('cod_tienda').innerText = r.cod_tienda || '-';
                    document.getElementById('nombre_tienda').innerText = r.nombre_tienda || '-';
                    document.getElementById('origen').innerText = r.origen || 'CD MASS TRUJILLO';
                    document.getElementById('descripcion').innerText = r.descripcion || '-';
                }

                // Inyectar las imágenes en pantalla
                if (r.url_packing) {
                    document.getElementById('box_packing').style.display = 'block';
                    document.getElementById('img_packing').src = r.url_packing;
                }
                if (r.url_pallet) {
                    document.getElementById('box_pallet').style.display = 'block';
                    document.getElementById('img_pallet').src = r.url_pallet;
                }
            }
        } catch (err) {
            console.error("Error al cargar reporte desde Google:", err);
            if (!dataParam) {
                document.getElementById('fecha_reporte').innerText = 'Error al cargar los datos.';
            }
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

function imprimirFoto() {
    const imgSrc = document.getElementById('modalImage').src;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Imprimir Evidencia</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${imgSrc}" style="max-width:100%;max-height:100vh;" onload="window.print();window.close();"/></body></html>`);
    printWindow.document.close();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarModal();
});

document.addEventListener('DOMContentLoaded', cargarReporte);