// Configuración Global de Google Apps Script Web App
// Reemplaza esta URL con la que obtengas al desplegar tu Apps Script en Google Sheets
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwL5aMRL75l9BhOg89VAFMpY2f6sPlqCS6fq6Vgfw6eyeNtdVvOaYxrAhNyzhKa2UNX/exec';

const ADMIN_PIN = "1234";

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