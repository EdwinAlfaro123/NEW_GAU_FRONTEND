// JS/controllers/usuarioController.js
class UsuarioController {
    constructor() {
        this.usuarioService = new UsuarioService();
        this.currentPage = 0;
        this.pageSize = 5;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.cargarUsuarios();
    }

    setupEventListeners() {
        // Los event listeners se configurarán cuando se cargue el módulo
    }

    setupModuleEventListeners() {
        // Event listeners para el modal de usuarios
        document.getElementById('newUserBtn')?.addEventListener('click', () => {
            this.limpiarFormularioUsuario();
            document.getElementById('userModal').style.display = 'block';
        });

        document.getElementById('closeUserModal')?.addEventListener('click', () => {
            document.getElementById('userModal').style.display = 'none';
        });

        document.getElementById('cancelUserForm')?.addEventListener('click', () => {
            document.getElementById('userModal').style.display = 'none';
        });

        document.getElementById('clearUserForm')?.addEventListener('click', () => {
            this.limpiarFormularioUsuario();
            this.mostrarMensaje('Formulario limpiado', 'Todos los campos han sido restablecidos', 'info');
        });

        // Form submit
        document.getElementById('userForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarUsuario();
        });

        // Filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.aplicarFiltrosUsuarios();
        });


        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.limpiarFiltrosUsuarios();
        });

        // Búsqueda en tiempo real
        document.getElementById('searchUser')?.addEventListener('input', () => {
            this.aplicarFiltrosUsuarios();
        });

        document.getElementById("modalRegion")?.addEventListener("change", (e) => {
            this.cargarDepartamentos(e.target.value);
        });

        document.getElementById("modalDepartamento")?.addEventListener("change", (e) => {
            const region = document.getElementById("modalRegion").value;
            this.cargarMunicipios(region, e.target.value);
        });

        document.getElementById("modalMunicipio")?.addEventListener("change", (e) => {
            const region = document.getElementById("modalRegion").value;
            const departamento = document.getElementById("modalDepartamento").value;
            this.cargarDistritos(region, departamento, e.target.value);
        });
    }

    // ===============================================
    // CARGAR DATOS SEGÚN REGIÓN
    // ===============================================
    cargarDepartamentos(region) {
        const departamentoSelect = document.getElementById("modalDepartamento");
        const municipioSelect = document.getElementById("modalMunicipio");
        const distritoSelect = document.getElementById("modalDistrito");

        departamentoSelect.innerHTML = "<option value=''>Seleccione un departamento</option>";
        municipioSelect.innerHTML = "<option value=''>Seleccione un municipio</option>";
        distritoSelect.innerHTML = "<option value=''>Seleccione un distrito</option>";

        const data = datosGeograficos[region]?.departamentos;

        if (!data) return;

        Object.keys(data).forEach(dep => {
            const opt = document.createElement("option");
            opt.value = dep;
            opt.textContent = dep;
            departamentoSelect.appendChild(opt);
        });
    }

    // ===============================================
    // CARGAR MUNICIPIOS SEGÚN DEPARTAMENTO
    // ===============================================
    cargarMunicipios(region, departamento) {
        const municipioSelect = document.getElementById("modalMunicipio");
        const distritoSelect = document.getElementById("modalDistrito");

        municipioSelect.innerHTML = "<option value=''>Seleccione un municipio</option>";
        distritoSelect.innerHTML = "<option value=''>Seleccione un distrito</option>";

        const data = datosGeograficos[region]?.departamentos?.[departamento]?.municipios;

        if (!data) return;

        Object.keys(data).forEach(mun => {
            const opt = document.createElement("option");
            opt.value = mun;
            opt.textContent = mun;
            municipioSelect.appendChild(opt);
        });
    }

    // ===============================================
    // CARGAR DISTRITOS SEGÚN MUNICIPIO
    // ===============================================
    cargarDistritos(region, departamento, municipio) {
        const distritoSelect = document.getElementById("modalDistrito");
        distritoSelect.innerHTML = "<option value=''>Seleccione un distrito</option>";

        const data = datosGeograficos[region]?.departamentos?.[departamento]?.municipios?.[municipio]?.distritos;

        if (!data) return;

        data.forEach(dis => {
            const opt = document.createElement("option");
            opt.value = dis;
            opt.textContent = dis;
            distritoSelect.appendChild(opt);
        });
    }


    async cargarUsuarios() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const loadingDiv = document.getElementById('usersLoading');
        
        if (loadingDiv) loadingDiv.classList.add('show');
        
        try {
            const response = await this.usuarioService.getAllUsuarios(this.currentPage, this.pageSize);
            const usuarios = response.content || [];

            tbody.innerHTML = '';

            if (usuarios.length === 0) {
                tbody.innerHTML = this.crearEstadoVacio('usuarios');
            } else {
                usuarios.forEach(usuario => {
                    const tr = this.crearFilaUsuario(usuario);
                    tbody.appendChild(tr);
                });
            }

            this.actualizarPaginacionUsuarios(response.totalElements);
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            this.mostrarError('Error al cargar usuarios', error.message);
            tbody.innerHTML = this.crearEstadoError();
        } finally {
            if (loadingDiv) loadingDiv.classList.remove('show');
        }
    }

    crearFilaUsuario(usuario) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.telefono}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.region}</td>
            <td><span class="status-badge status-active">Activo</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="usuarioController.editarUsuario(${usuario.id})" title="Editar usuario">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="usuarioController.eliminarUsuario(${usuario.id})" title="Eliminar usuario">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        return tr;
    }

    async guardarUsuario() {
        const userId = document.getElementById('userId')?.value;
        const formData = this.obtenerDatosFormularioUsuario();

        // Validación básica
        if (!this.validarFormularioUsuario(formData, !userId)) {
            return;
        }

        try {
            const usuarioDTO = this.usuarioService.convertirFormDataADTO(formData);

            if (userId) {
                // Editar usuario existente
                await this.usuarioService.updateUsuario(userId, usuarioDTO);
                this.mostrarMensaje('¡Éxito!', 'Usuario actualizado correctamente', 'success');
            } else {
                // Crear nuevo usuario
                await this.usuarioService.createUsuario(usuarioDTO);
                this.mostrarMensaje('¡Éxito!', 'Usuario creado correctamente', 'success');
            }

            document.getElementById('userModal').style.display = 'none';
            this.cargarUsuarios();
            
        } catch (errora) {
            console.error('Error al guardar usuario:', error);
            this.mostrarError('Error al guardar usuario', error.message);
        }
    }

    async editarUsuario(id) {
        try {
            // 🔥 AHORA SÍ: Trae al usuario directamente por ID (NO por paginación)
            const usuario = await this.usuarioService.getUsuarioById(id);

            if (!usuario) {
                this.mostrarError('Error', 'Usuario no encontrado');
                return;
            }

            this.llenarFormularioUsuario(usuario);
            document.getElementById('userModal').style.display = 'block';

        } catch (error) {
            console.error('Error al cargar usuario para editar:', error);
            this.mostrarError('Error', 'No se pudo cargar el usuario para editar');
        }
    }


    async eliminarUsuario(id) {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#718096'
        });

        if (result.isConfirmed) {
            try {
                await this.usuarioService.deleteUsuario(id);
                this.mostrarMensaje('Eliminado!', 'El usuario ha sido eliminado', 'success');
                this.cargarUsuarios();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                this.mostrarError('Error', 'No se pudo eliminar el usuario');
            }
        }
    }

    // Métodos auxiliares
    obtenerDatosFormularioUsuario() {
        return {
            nombres: document.getElementById('modalNombres').value,
            telefono: document.getElementById('modalTelefono').value,
            email: document.getElementById('modalEmail').value,
            unidad: document.getElementById('modalUnidad').value,
            password: document.getElementById('modalPassword').value,
            rol: document.getElementById('modalRol').value,
            region: document.getElementById('modalRegion').value,
            departamento: document.getElementById('modalDepartamento').value,
            municipio: document.getElementById('modalMunicipio').value,
            distrito: document.getElementById('modalDistrito').value,
            filtrado: document.getElementById('modalFiltrado').value
        };
    }

    llenarFormularioUsuario(usuario) {
        const formData = this.usuarioService.convertirDTOAFormData(usuario);
        
        document.getElementById('modalUserTitle').textContent = 'Editar Usuario';
        document.getElementById('userId').value = formData.id;
        document.getElementById('modalNombres').value = formData.nombres;
        document.getElementById('modalTelefono').value = formData.telefono;
        document.getElementById('modalEmail').value = formData.email;
        document.getElementById('modalUnidad').value = formData.unidad;
        document.getElementById('modalRol').value = formData.rol;
        document.getElementById('modalRegion').value = formData.region;
        document.getElementById('modalFiltrado').value = formData.filtrado;
        
        // Cargar datos geográficos
        this.cargarDatosGeograficos(formData.region, formData.departamento, formData.distrito, formData.municipio);
        
        // Ocultar campos de contraseña en edición
        const passwordInput = document.getElementById('modalPassword');
        const confirmPasswordInput = document.getElementById('modalConfirmPassword');

        passwordInput.value = formData.password || '********'; // mostrar valor real o placeholder
        confirmPasswordInput.value = formData.password || '********';

        passwordInput.readOnly = true;
        confirmPasswordInput.readOnly = true;

        passwordInput.required = false;
        confirmPasswordInput.required = false;
    }

    validarFormularioUsuario(formData, esNuevo) {
        if (!formData.nombres || !formData.email || !formData.telefono || !formData.rol) {
            this.mostrarError('Error', 'Por favor complete todos los campos obligatorios');
            return false;
        }

        if (esNuevo && (!formData.password || formData.password !== document.getElementById('modalConfirmPassword').value)) {
            this.mostrarError('Error', 'Las contraseñas no coinciden');
            return false;
        }

        return true;
    }

    limpiarFormularioUsuario() {
        const form = document.getElementById('userForm');
        if (form) {
            form.reset();
            document.getElementById('userId').value = '';
            
            // Mostrar campos de contraseña
            const passwordInput = document.getElementById('modalPassword');
            const confirmPasswordInput = document.getElementById('modalConfirmPassword');

            passwordInput.value = '';
            confirmPasswordInput.value = '';

            passwordInput.readOnly = false;
            confirmPasswordInput.readOnly = false;

            passwordInput.required = true;
            confirmPasswordInput.required = true;
        }
        
        // Limpiar selects dependientes
        const distritoSelect = document.getElementById('modalDistrito');
        const municipioSelect = document.getElementById('modalMunicipio');
        const departamentoSelect = document.getElementById('modalDepartamento');
        if (distritoSelect) distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';
        if (municipioSelect) municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
        if (departamentoSelect) departamentoSelect.innerHTML = '<option value="">Seleccione un departamento</option>';
    }

    // Función para aplicar filtros cuando se haga click
    aplicarFiltrosUsuarios() {
        try {
            const searchValue = document.getElementById('searchUser').value.toLowerCase();
            const roleFilter = document.getElementById('filterRole').value;
            const statusFilter = document.getElementById('filterStatusUsuario').value;

            if (!this.usuarios) return; // previene error si no hay datos

            let filtered = this.usuarios.filter(u => {
                const matchesSearch = (u.nombres || '').toLowerCase().includes(searchValue) ||
                                    (u.email || '').toLowerCase().includes(searchValue);
                const matchesRole = roleFilter === '' || u.rol === roleFilter;
                const matchesStatus = statusFilter === '' || u.estado === statusFilter;

                return matchesSearch && matchesRole && matchesStatus;
            });

            this.renderizarUsuarios(filtered);

        } catch (error) {
            console.error('Error al aplicar filtros:', error);
        }
    }


    limpiarFiltrosUsuarios() {
        const searchUser = document.getElementById('searchUser');
        const filterRole = document.getElementById('filterRole');
        const filterStatus = document.getElementById('filterStatus');
        
        if (searchUser) searchUser.value = '';
        if (filterRole) filterRole.value = '';
        if (filterStatus) filterStatus.value = '';
        
        this.aplicarFiltrosUsuarios();
    }

    cargarDatosGeograficos(region, departamentoSeleccionado = '', distritoSeleccionado = '', municipioSeleccionado = '') {
        const datosRegion = window.datosGeograficos?.[region];
        if (!datosRegion) return;

        const departamentoSelect = document.getElementById('modalDepartamento');
        const municipioSelect = document.getElementById('modalMunicipio');
        const distritoSelect = document.getElementById('modalDistrito');

        // Limpiar selects
        departamentoSelect.innerHTML = "<option value=''>Seleccione un departamento</option>";
        municipioSelect.innerHTML = "<option value=''>Seleccione un municipio</option>";
        distritoSelect.innerHTML = "<option value=''>Seleccione un distrito</option>";

        // Cargar departamentos
        Object.keys(datosRegion.departamentos).forEach(dep => {
            const option = document.createElement('option');
            option.value = dep;
            option.textContent = dep;
            if (dep === departamentoSeleccionado) option.selected = true;
            departamentoSelect.appendChild(option);
        });

        // Cargar municipios (si hay departamento seleccionado)
        if (departamentoSeleccionado && datosRegion.departamentos[departamentoSeleccionado]) {
            const municipios = datosRegion.departamentos[departamentoSeleccionado].municipios;
            Object.keys(municipios).forEach(mun => {
                const option = document.createElement('option');
                option.value = mun;
                option.textContent = mun;
                if (mun === municipioSeleccionado) option.selected = true;
                municipioSelect.appendChild(option);
            });

            // Cargar distritos (si hay municipio seleccionado)
            if (municipioSeleccionado && municipios[municipioSeleccionado]) {
                municipios[municipioSeleccionado].distritos.forEach(dis => {
                    const option = document.createElement('option');
                    option.value = dis;
                    option.textContent = dis;
                    if (dis === distritoSeleccionado) option.selected = true;
                    distritoSelect.appendChild(option);
                });
            }
        }
    }


    actualizarPaginacionUsuarios(totalItems) {
        const totalPages = Math.ceil(totalItems / this.pageSize);
        const showingStart = (this.currentPage * this.pageSize) + 1;
        const showingEnd = Math.min((this.currentPage + 1) * this.pageSize, totalItems);
        
        const showingElement = document.getElementById('usersShowing');
        const totalElement = document.getElementById('usersTotal');
        
        if (showingElement) showingElement.textContent = `${showingStart}-${showingEnd}`;
        if (totalElement) totalElement.textContent = totalItems;
        
        this.actualizarControlesPaginacion('usersPagination', totalPages);
    }

    actualizarControlesPaginacion(paginationId, totalPages) {
        const paginationControls = document.getElementById(paginationId);
        if (!paginationControls) return;

        paginationControls.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = 'Anterior';
        prevBtn.disabled = this.currentPage === 0;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.cargarUsuarios();
            }
        });
        paginationControls.appendChild(prevBtn);
        
        // Números de página
        const maxPagesToShow = 5;
        let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i + 1;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.cargarUsuarios();
            });
            paginationControls.appendChild(pageBtn);
        }
        
        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = 'Siguiente';
        nextBtn.disabled = this.currentPage === totalPages - 1;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.cargarUsuarios();
            }
        });
        paginationControls.appendChild(nextBtn);
    }

    crearEstadoVacio(tipo) {
        const icon = tipo === 'actividades' ? 'fa-clipboard-list' : 'fa-users';
        const mensaje = tipo === 'actividades' ? 'No hay actividades registradas' : 'No se encontraron usuarios';
        const submensaje = tipo === 'actividades' ? 'Comience registrando una nueva actividad' : 'Intente ajustar los filtros de búsqueda';
        
        return `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas ${icon}"></i>
                    <h3>${mensaje}</h3>
                    <p>${submensaje}</p>
                </td>
            </tr>
        `;
    }

    crearEstadoError() {
        return `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar los datos</h3>
                    <p>Intente recargar la página</p>
                </td>
            </tr>
        `;
    }

    mostrarMensaje(titulo, texto, icono) {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }

    mostrarError(titulo, texto) {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2d3748'
        });
    }
}

// Instancia global del controller
const usuarioController = new UsuarioController();