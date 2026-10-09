let filePacking = null;
let filePallet = null;

// Convertidor de imagen a formato Base64 para almacenar en Google Sheets
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Cargar y previsualizar imágenes
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

// Escuchadores de eventos
document.addEventListener('DOMContentLoaded', () => {
    // Foto 1: Packing List
    document.getElementById('btn_packing_cam').addEventListener('click', () => document.getElementById('foto_packing_cam').click());
    document.getElementById('btn_packing_gal').addEventListener('click', () => document.getElementById('foto_packing_gal').click());
    document.getElementById('foto_packing_cam').addEventListener('change', function() { cargarFoto('packing', this); });
    document.getElementById('foto_packing_gal').addEventListener('change', function() { cargarFoto('packing', this); });

    // Foto 2: Pallet Físico
    document.getElementById('btn_pallet_cam').addEventListener('click', () => document.getElementById('foto_pallet_cam').click());
    document.getElementById('btn_pallet_gal').addEventListener('click', () => document.getElementById('foto_pallet_gal').click());
    document.getElementById('foto_pallet_cam').addEventListener('change', function() { cargarFoto('pallet', this); });
    document.getElementById('foto_pallet_gal').addEventListener('change', function() { cargarFoto('pallet', this); });

    // Consulta de Tienda en Vivo por código
    document.getElementById('cod_tienda').addEventListener('input', function() {
        buscarTiendaEnGoogleSheets(this.value.trim());
    });

    // Envío del Formulario
    document.getElementById('incidenciaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('btnGuardar');
        btn.disabled = true;
        btn.innerText = "⏳ Guardando incidencia en Google Sheets...";

        try {
            let base64Packing = "";
            let base64Pallet = "";

            if (filePacking) {
                base64Packing = await fileToBase64(filePacking);
            }
            if (filePallet) {
                base64Pallet = await fileToBase64(filePallet);
            }

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
            alert("Error al guardar la incidencia: " + err.message);
            btn.disabled = false;
            btn.innerText = "Guardar Incidencia";
        }
    });
});