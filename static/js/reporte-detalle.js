async function cargarReporte() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    try {
        let url = `${GOOGLE_SCRIPT_URL}?action=getReport`;
        if (idParam) {
            url += `&id=${encodeURIComponent(idParam)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'success' || !data.reporte) {
            document.getElementById('fecha_reporte').innerText = 'No se encontró el reporte.';
            return;
        }

        const r = data.reporte;

        document.getElementById('fecha_reporte').innerText = r.fecha_registro || '-';
        document.getElementById('fecha_validador').innerText = r.fecha_validador || '-';
        document.getElementById('auditor').innerText = r.auditor || '-';
        document.getElementById('turno').innerText = r.turno || '-';
        document.getElementById('nro_pallet').innerText = r.nro_pallet || '-';
        document.getElementById('cod_tienda').innerText = r.cod_tienda || '-';
        document.getElementById('nombre_tienda').innerText = r.nombre_tienda || '-';
        document.getElementById('origen').innerText = r.origen || 'CD MASS TRUJILLO';
        document.getElementById('descripcion').innerText = r.descripcion || '-';

        if (r.url_packing) {
            document.getElementById('box_packing').style.display = 'block';
            document.getElementById('img_packing').src = r.url_packing;
        }

        if (r.url_pallet) {
            document.getElementById('box_pallet').style.display = 'block';
            document.getElementById('img_pallet').src = r.url_pallet;
        }
    } catch (err) {
        console.error("Error al cargar el reporte:", err);
        document.getElementById('fecha_reporte').innerText = 'Error al cargar los datos.';
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