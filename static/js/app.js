let filePacking = null;
let filePallet = null;

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
        prev.innerHTML = `📌 <strong>Foto Packing:</strong> ${file.name}`;
        escanearOCR(file);
    } else {
        filePallet = file;
        const prev = document.getElementById('preview_pallet');
        prev.style.display = 'block';
        prev.innerHTML = `📌 <strong>Foto Pallet:</strong> ${file.name}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

            if (filePacking) base64Packing = await comprimirImagen(filePacking);
            if (filePallet) base64Pallet = await comprimirImagen(filePallet);

            btn.innerText = "⏳ Guardando en Google Sheets...";

            const payload = {
                fecha_validador: document.getElementById('fecha_validador').value,
                auditor: document.getElementById('auditor').value,
                turno: document.getElementById('turno').value,
                nro_pallet: document.getElementById('nro_pallet').value,
                cod_tienda: document.getElementById('cod_tienda').value,
                nombre_tienda: document.getElementById('nombre_tienda').value,
                descripcion: document.getElementById('descripcion').value,
                url_packing: base64Packing,
                url_pallet: base64Pallet
            };

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                window.location.href = `reporte.html?id=${result.id}`;
            } else {
                throw new Error(result.message || "Error al registrar en Google Sheets");
            }
        } catch (err) {
            alert("Error al guardar: " + err.message);
            btn.disabled = false;
            btn.innerText = "Guardar Incidencia";
        }
    });
});