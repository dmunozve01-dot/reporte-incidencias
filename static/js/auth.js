function renderUserBar() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    if (document.getElementById('userRoleBar')) return;

    const role = getRole();
    const roleBar = document.createElement('div');
    roleBar.id = 'userRoleBar';
    roleBar.className = 'user-role-bar';

    if (role === 'admin') {
        roleBar.innerHTML = `
            <span class="badge-role badge-admin">🔑 Administrador</span>
            <button onclick="cerrarSesionRol()" class="btn-change-role">Cambiar Rol</button>
        `;
    } else if (role === 'invitado') {
        roleBar.innerHTML = `
            <span class="badge-role badge-guest">👤 Invitado</span>
            <button onclick="cerrarSesionRol()" class="btn-change-role">Cambiar Rol</button>
        `;
    }

    headerActions.prepend(roleBar);
}

function renderAuthModal() {
    if (document.getElementById('authModal')) return;

    const modalHTML = `
        <div id="authModal" class="modal-auth-overlay" style="display: none;">
            <div class="modal-auth-card">
                <h3>🔒 Selecciona tu perfil de acceso</h3>
                <p>Elige el perfil con el que deseas ingresar al sistema:</p>
                
                <div class="auth-options">
                    <button id="btnAuthInvitado" class="btn-auth-opt btn-guest">
                        <span>👤 Continuar como Invitado</span>
                        <small>Crear reportes, ver historial y editar</small>
                    </button>
                    
                    <button id="btnAuthAdminShow" class="btn-auth-opt btn-admin">
                        <span>🔑 Ingresar como Administrador</span>
                        <small>Acceso completo (Crear, editar, ver y eliminar)</small>
                    </button>
                </div>

                <div id="adminPinBox" style="display: none; margin-top: 15px;">
                    <label style="display:block; font-size: 0.85rem; font-weight:600; margin-bottom: 6px; text-align: left;">Ingresa el PIN de Administrador:</label>
                    <input type="password" id="inputAdminPin" placeholder="PIN de Administrador" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; margin-bottom: 10px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="btnAuthAdminConfirm" class="btn-success" style="flex:1;">Ingresar</button>
                        <button id="btnAuthAdminCancel" class="btn-secondary" style="flex:1;">Cancelar</button>
                    </div>
                    <small id="authPinError" style="color: #ef4444; font-weight: bold; display: block; margin-top: 8px; text-align: center;"></small>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('btnAuthInvitado').addEventListener('click', () => {
        setRole('invitado');
        document.getElementById('authModal').style.display = 'none';
        window.location.reload();
    });

    document.getElementById('btnAuthAdminShow').addEventListener('click', () => {
        document.querySelector('.auth-options').style.display = 'none';
        document.getElementById('adminPinBox').style.display = 'block';
    });

    document.getElementById('btnAuthAdminCancel').addEventListener('click', () => {
        document.getElementById('adminPinBox').style.display = 'none';
        document.querySelector('.auth-options').style.display = 'flex';
        document.getElementById('authPinError').innerText = '';
    });

    document.getElementById('btnAuthAdminConfirm').addEventListener('click', () => {
        const pin = document.getElementById('inputAdminPin').value;
        if (pin === ADMIN_PIN) {
            setRole('admin');
            document.getElementById('authModal').style.display = 'none';
            window.location.reload();
        } else {
            document.getElementById('authPinError').innerText = '❌ PIN incorrecto. Intenta nuevamente.';
        }
    });
}

function checkAuthAndInit() {
    renderAuthModal();
    const role = getRole();

    if (!role) {
        document.getElementById('authModal').style.display = 'flex';
    } else {
        renderUserBar();
    }
}

document.addEventListener('DOMContentLoaded', checkAuthAndInit);