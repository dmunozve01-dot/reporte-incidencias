let filePacking = null;
let filePallet = null;
let currentEditId = null;
let existingUrlPacking = "";
let existingUrlPallet = "";

function comprimirImagen(file, maxDimension = 1000, calidad = 0.6) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64Res = canvas.toDataURL('image/jpeg', calidad);
                resolve(base64Res);
            };
            img.onerror = () => resolve("");
        };
        reader.onerror = () => resolve("");
    });
}

function cargarFoto(tipo, input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (tipo === 'packing') {
        filePacking = file;
        const prev = document.getElementById('preview_packing');
        prev.style.display = 'block';
        prev.innerHTML = `📌 <strong>Nueva Foto Packing:</strong> ${file.name}`;
        escanearOCR(file);
    } else {
        filePallet = file;
        const prev = document.getElementById('preview_pallet');
        prev.style.display = 'block';
        prev.innerHTML = `📌 <strong>Nueva Foto Pallet:</strong> ${file.name}`;
    }
}

async function verificarModoEdicion() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        currentEditId = id;
        const titulo = document.querySelector('.header-actions h2');
        const btnGuardar = document.getElementById('btnGuardar');

        if (titulo) titulo.innerText = "✏️ Editar Incidencia";
        if (btnGuardar) btnGuardar.innerText = "Actualizar Incidencia";

        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getReport&id=${encodeURIComponent(id)}`);
            const data = await res.json();

            if (data.status === 'success' && data.reporte) {
                const r = data.reporte;
                document.getElementById('fecha_validador').value = r.fecha_validador || '';
                document.getElementById('auditor').value = r.auditor || '';
                document.getElementById('turno').value = r.turno || '';
                document.getElementById('nro_pallet').value = r.nro_pallet || '';
                document.getElementById('cod_tienda').value = r.cod_tienda || '';
                document.getElementById('nombre_tienda').value = r.nombre_tienda || '';
                document.getElementById('descripcion').value = r.descripcion || '';

                existingUrlPacking = r.url_packing || '';
                existingUrlPallet = r.url_pallet || '';

                if (existingUrlPacking && existingUrlPacking.startsWith('http')) {
                    const prevP = document.getElementById('preview_packing');
                    prevP.style.display = 'block';
                    prevP.innerHTML = `📷 <strong>Foto Packing actual:</strong> <a href="${existingUrlPacking}" target="_blank">Ver foto</a> (Sube otra solo para reemplazarla)`;
                }

                if (existingUrlPallet && existingUrlPallet.startsWith('http')) {
                    const prevPal = document.getElementById('preview_pallet');
                    prevPal.style.display = 'block';
                    prevPal.innerHTML = `📷 <strong>Foto Pallet actual:</strong> <a href="${existingUrlPallet}" target="_blank">Ver foto</a> (Sube otra solo para reemplazarla)`;
                }
            }
        } catch (err) {
            console.error("Error al cargar datos para edicion:", err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarModoEdicion();

    document.getElementById('btn_packing_cam').addEventListener('click', () => document.getElementById('foto_packing_cam').click());
    document.getElementById('btn_packing_gal').addEventListener('click', () => document.getElementById('foto_packing_gal').click());
    document.getElementById('foto_packing_cam').addEventListener('change', function() { cargarFoto('packing', this); });
    document.getElementById('foto_packing_gal').addEventListener('change', function() { cargarFoto('packing', this); });

    document.getElementById('btn_pallet_cam').addEventListener('click', () => document.getElementById('foto_pallet_cam').click());
    document.getElementById('btn_pallet_gal').addEventListener('click', () => document.getElementById('foto_pallet_gal').click());
    document.getElementById('foto_pallet_cam').addEventListener('change', function() { cargarFoto('pallet', this); });
    document.getElementById('foto_pallet_gal').addEventListener('change', function() { cargarFoto('pallet', this); });

    document.getElementById('cod_tienda').addEventListener('input', function() {
        buscarTiendaEnGoogleSheets(this.value.trim());
    });

    document.getElementById('incidenciaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('btnGuardar');
        btn.disabled = true;
        btn.innerText = "⏳ Procesando imágenes...";

        try {
            let base64Packing = "";
            let base64Pallet = "";

            if (filePacking) {
                base64Packing = await comprimirImagen(filePacking);
            }
            if (filePallet) {
                base64Pallet = await comprimirImagen(filePallet);
            }

            btn.innerText = "⏳ Guardando cambios en Google Sheets...";

            const payload = {
                id: currentEditId || "",
                fecha_validador: document.getElementById('fecha_validador').value,
                auditor: document.getElementById('auditor').value,
                turno: document.getElementById('turno').value,
                nro_pallet: document.getElementById('nro_pallet').value,
                cod_tienda: document.getElementById('cod_tienda').value,
                nombre_tienda: document.getElementById('nombre_tienda').value,
                descripcion: document.getElementById('descripcion').value,
                url_packing: base64Packing || existingUrlPacking,
                url_pallet: base64Pallet || existingUrlPallet
            };

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.location.href = `reporte.html?id=${result.id}`;
            } else {
                throw new Error(result.message || "Error al actualizar en Google Sheets");
            }
        } catch (err) {
            alert("Error al guardar: " + err.message);
            btn.disabled = false;
            btn.innerText = currentEditId ? "Actualizar Incidencia" : "Guardar Incidencia";
        }
    });
});