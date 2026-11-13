// Configuración Global de Google Apps Script Web App
// Reemplaza esta URL con la que obtengas al desplegar tu Apps Script en Google Sheets
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynCV9vmmcsGAJVpUJqV1qgYFt51K7ginLUM86fSsDzqsN9Q8y9aUrH8Pouk-p7fnZ1/exec';

const ADMIN_PIN = "Marceloo159";

function getRole() {
    return localStorage.getItem('user_role') || null;
}

function setRole(role) {
    localStorage.setItem('user_role', role);
}

function cerrarSesionRol() {
    localStorage.removeItem('user_role');
    window.location.reload();
}