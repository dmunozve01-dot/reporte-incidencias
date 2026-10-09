/**
 * Consulta en Google Sheets (pestaña TIENDAS) el nombre comercial del código escaneado
 */
async function buscarTiendaEnGoogleSheets(codigo) {
    if (!codigo || codigo.trim() === "") return;

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?codigo=${encodeURIComponent(codigo.trim())}`);
        const data = await res.json();

        if (data.status === 'success' && data.nombre) {
            document.getElementById('nombre_tienda').value = data.nombre;
        }
    } catch (e) {
        console.error("Error al consultar la tienda en Google Sheets:", e);
    }
}

/**
 * Escanea la imagen seleccionada utilizando la API de OCR.space (Engine 2)
 */
async function escanearOCR(file) {
    const estado = document.getElementById('estado_escaneo');
    estado.innerText = "🔍 Escaneando etiqueta...";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', 'helloworld');
    formData.append('language', 'spa');
    formData.append('OCREngine', '2');

    try {
        const res = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.ParsedResults && data.ParsedResults.length > 0) {
            const texto = data.ParsedResults[0].ParsedText.toUpperCase();

            // 1. Auditor (NOMBRE: ...)
            const nombreMatch = texto.match(/NOMBRE[\s\:\-]+([A-Z\xc1\xe1\xc9\xe9\xCD\xed\xD3\xf3\xDA\xfa\xD1\xf1\s]+?)(?=\s*FECHA|\s*TURNO|\n|\r|$)/i);
            if (nombreMatch && nombreMatch[1].trim().length >= 3) {
                document.getElementById('auditor').value = nombreMatch[1].trim();
            }

            // 2. Fecha Validador (FECHA: DD/MM/YY)
            const fechaMatch = texto.match(/FECHA[\s\:\-]+([0-9O]{1,2})[\s\/\-\.]*([0-9O]{1,2})[\s\/\-\.]*([0-9O]{2,4})/i);
            if (fechaMatch) {
                const dia = fechaMatch[1].replace(/O/gi, '0').padStart(2, '0');
                const mes = fechaMatch[2].replace(/O/gi, '0').padStart(2, '0');
                let anio = fechaMatch[3].replace(/O/gi, '0');
                if (anio.length === 4) anio = anio.slice(-2);
                document.getElementById('fecha_validador').value = `${dia}/${mes}/${anio}`;
            }

            // 3. Turno (TURNO: ...)
            const turnoMatch = texto.match(/TURNO[\s\:\-]+([A-Z]+)/i);
            if (turnoMatch) {
                document.getElementById('turno').value = turnoMatch[1].trim();
            }

            // 4. Nro. Pallet (01PL...)
            const palletMatch = texto.match(/([0-9A-Z]{2}PL\d{10,14})/i);
            if (palletMatch) {
                document.getElementById('nro_pallet').value = palletMatch[1].toUpperCase().replace(/^[0-9A-Z]{2}PL/, '01PL');
            }

            // 5. Cód. Tienda entre paréntesis (ej: (2346)) o extraído del pallet
            let codExtraido = "";
            const codMatch = texto.match(/\(([0-9]{4})\)/);
            if (codMatch) {
                codExtraido = codMatch[1];
            } else if (palletMatch && palletMatch[1].length >= 8) {
                codExtraido = palletMatch[1].substring(4, 8);
            }

            if (codExtraido) {
                document.getElementById('cod_tienda').value = codExtraido;
                await buscarTiendaEnGoogleSheets(codExtraido);
            }

            // 6. Nombre de Tienda / Destino (Fallback si no devuelve de Google Sheets)
            if (!document.getElementById('nombre_tienda').value) {
                const tiendaConCodigoMatch = texto.match(/([A-Z0-9\s\-\.]{3,50})\s*\(([0-9]{4})\)/);
                if (tiendaConCodigoMatch) {
                    let nombreLimpio = tiendaConCodigoMatch[1].replace(/^.*DESTINO[\s\:\-]*/i, '').replace(/[\®\©\™\*]/g, '').trim();
                    if (nombreLimpio.length >= 3) {
                        document.getElementById('nombre_tienda').value = nombreLimpio;
                    }
                }
            }

            estado.innerText = "✅ Datos extraídos correctamente.";
        } else {
            estado.innerText = "⚠️ No se detectó texto. Complete los datos manualmente.";
        }
    } catch (e) {
        console.error("Error en escaneo OCR:", e);
        estado.innerText = "⚠️ Error al escanear. Complete manualmente.";
    }
}