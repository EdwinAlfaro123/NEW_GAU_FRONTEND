// JS/controllers/actividadController.js
class ActividadController {
    constructor() {
        this.actividadService = new ActividadService();
        this.currentPage = 0;
        this.pageSize = 5;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModuleEventListeners();
        this.cargarActividades();
    }

    setupEventListeners() {
        // Los event listeners se configurarán cuando se cargue el módulo
    }

    setupModuleEventListeners() {
        // Event listeners para el modal de actividades
        document.getElementById('newActivityBtn')?.addEventListener('click', () => {
            this.limpiarFormularioActividad();
            document.getElementById('activityModal').style.display = 'block';
        });

        document.getElementById('closeActivityModal')?.addEventListener('click', () => {
            document.getElementById('activityModal').style.display = 'none';
        });

        document.getElementById('cancelActivityForm')?.addEventListener('click', () => {
            document.getElementById('activityModal').style.display = 'none';
        });

        document.getElementById('clearActivityForm')?.addEventListener('click', () => {
            this.limpiarFormularioActividad();
            this.mostrarMensaje('Formulario limpiado', 'Todos los campos han sido restablecidos', 'info');
        });

        // Form submit
        document.getElementById('activityForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarActividad();
        });

        // Filtros
        document.getElementById('applyActivityFilters')?.addEventListener('click', () => {
            this.aplicarFiltrosActividades();
        });

        document.getElementById('clearActivityFilters')?.addEventListener('click', () => {
            this.limpiarFiltros();
        });

        document.getElementById("activityRegion")?.addEventListener("change", (e) => {
            this.cargarDepartamentos(e.target.value);
        });

        document.getElementById("activityDepartamento")?.addEventListener("change", (e) => {
            const region = document.getElementById("activityRegion").value;
            this.cargarMunicipios(region, e.target.value);
        });

        document.getElementById("activityMunicipio")?.addEventListener("change", (e) => {
            const region = document.getElementById("activityRegion").value;
            const departamento = document.getElementById("activityDepartamento").value;
            this.cargarDistritos(region, departamento, e.target.value);
        });

        // Modal de detalles
        document.getElementById('closeActivityDetailModal')?.addEventListener('click', () => {
            document.getElementById('activityDetailModal').style.display = 'none';
        });

        document.getElementById('closeDetailBtn')?.addEventListener('click', () => {
            document.getElementById('activityDetailModal').style.display = 'none';
        });
    }

    // ===============================================
    // CARGAR DATOS SEGÚN REGIÓN
    // ===============================================
    cargarDepartamentos(region) {
        const departamentoSelect = document.getElementById("activityDepartamento");
        const municipioSelect = document.getElementById("activityMunicipio");
        const distritoSelect = document.getElementById("activityDistrito");

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
        const municipioSelect = document.getElementById("activityMunicipio");
        const distritoSelect = document.getElementById("activityDistrito");

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
        const distritoSelect = document.getElementById("activityDistrito");
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

    async cargarActividades() {
        const tbody = document.getElementById('activitiesTableBody');
        if (!tbody) return;

        const loadingDiv = document.getElementById('activitiesLoading');
        
        if (loadingDiv) loadingDiv.classList.add('show');
        
        try {
            const response = await this.actividadService.getAllActividades(this.currentPage, this.pageSize);
            const actividades = response.content || [];

            tbody.innerHTML = '';

            if (actividades.length === 0) {
                tbody.innerHTML = this.crearEstadoVacio('actividades');
            } else {
                actividades.forEach(actividad => {
                    const tr = this.crearFilaActividad(actividad);
                    tbody.appendChild(tr);
                });
            }

            this.actualizarPaginacionActividades(response.totalElements);
            
        } catch (error) {
            console.error('Error al cargar actividades:', error);
            this.mostrarError('Error al cargar actividades', error.message);
            tbody.innerHTML = this.crearEstadoError();
        } finally {
            if (loadingDiv) loadingDiv.classList.remove('show');
        }
    }

    crearFilaActividad(actividad) {
        const tr = document.createElement('tr');
        
        const estadoClass = this.obtenerClaseEstado(actividad.estado);
        const estadoText = this.obtenerTextoEstado(actividad.estado);
        const fechaFormateada = new Date(actividad.fecha).toLocaleDateString('es-SV');

        tr.innerHTML = `
            <td>${actividad.id}</td>
            <td>${fechaFormateada}</td>
            <td>${actividad.actividad_nombre}</td>
            <td>${actividad.departamento}</td>
            <td>${actividad.municipio}</td>
            <td>${actividad.distrito}</td>
            <td>Usuario ${actividad.Id_Usuario}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn details" onclick="actividadController.mostrarDetallesActividad(${actividad.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button class="action-btn edit" onclick="actividadController.editarActividad(${actividad.id})" title="Editar actividad">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="actividadController.eliminarActividad(${actividad.id})" title="Eliminar actividad">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        return tr;
    }

    async guardarActividad() {
        const activityId = document.getElementById('activityId')?.value;
        const formData = this.obtenerDatosFormulario();

        // Validación básica
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            const actividadDTO = this.actividadService.convertirFormDataADTO(formData);

            if (activityId) {
                // Editar actividad existente
                await this.actividadService.updateActividad(activityId, actividadDTO);
                this.mostrarMensaje('¡Éxito!', 'Actividad actualizada correctamente', 'success');
            } else {
                // Crear nueva actividad
                await this.actividadService.createActividad(actividadDTO);
                this.mostrarMensaje('¡Éxito!', 'Actividad registrada correctamente', 'success');
            }

            document.getElementById('activityModal').style.display = 'none';
            this.cargarActividades();
            
        } catch (error) {
            console.error('Error al guardar actividad:', error);
            this.mostrarError('Error al guardar actividad', error.message);
        }
    }

    async editarActividad(id) {
        try {
            const response = await this.actividadService.getAllActividades(0, 1000);
            const actividad = response.content.find(a => a.id === id);
            
            if (!actividad) {
                this.mostrarError('Error', 'Actividad no encontrada');
                return;
            }

            this.llenarFormularioActividad(actividad);
            document.getElementById('activityModal').style.display = 'block';
            
        } catch (error) {
            console.error('Error al cargar actividad para editar:', error);
            this.mostrarError('Error', 'No se pudo cargar la actividad para editar');
        }
    }

    async eliminarActividad(id) {
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
                await this.actividadService.deleteActividad(id);
                this.mostrarMensaje('Eliminada!', 'La actividad ha sido eliminada', 'success');
                this.cargarActividades();
            } catch (error) {
                console.error('Error al eliminar actividad:', error);
                this.mostrarError('Error', 'No se pudo eliminar la actividad');
            }
        }
    }

    async mostrarDetallesActividad(id) {
        try {
            const response = await this.actividadService.getAllActividades(0, 1000);
            const actividad = response.content.find(a => a.id === id);
            
            if (!actividad) {
                this.mostrarError('Error', 'Actividad no encontrada');
                return;
            }

            this.llenarModalDetalles(actividad);
            document.getElementById('activityDetailModal').style.display = 'block';
            
        } catch (error) {
            console.error('Error al cargar detalles de actividad:', error);
            this.mostrarError('Error', 'No se pudieron cargar los detalles de la actividad');
        }
    }

    // Métodos auxiliares
    obtenerDatosFormulario() {
        return {
            estado: document.getElementById('activityEstado').value,
            fecha: document.getElementById('activityFecha').value,
            horaInicio: document.getElementById('activityInicio').value,
            horaFin: document.getElementById('activityFinalizacion').value,
            region: document.getElementById('activityRegion').value,
            departamento: document.getElementById('activityDepartamento').value,
            municipio: document.getElementById('activityMunicipio').value,
            distrito: document.getElementById('activityDistrito').value,
            actividad: document.getElementById('activityTipo').value,
            tareas: Array.from(document.getElementById('activityTareas').selectedOptions).map(opt => opt.value),
            participantesHombres: parseInt(document.getElementById('activityHombres').value) || 0,
            participantesMujeres: parseInt(document.getElementById('activityMujeres').value) || 0,
            resultados: document.getElementById('activityResultados').value,
            observaciones: document.getElementById('activityObservaciones').value,
        };
    }

    llenarFormularioActividad(actividad) {
        const formData = this.actividadService.convertirDTOAFormData(actividad);
        
        document.getElementById('modalActivityTitle').textContent = 'Editar Actividad';
        document.getElementById('activityId').value = formData.id;
        document.getElementById('activityEstado').value = formData.estado;
        document.getElementById('activityFecha').value = formData.fecha;
        document.getElementById('activityInicio').value = formData.horaInicio;
        document.getElementById('activityFinalizacion').value = formData.horaFin;
        document.getElementById('activityRegion').value = formData.region;
        document.getElementById('activityDepartamento').value = formData.departamento;
        document.getElementById('activityTipo').value = formData.actividad;
        
        // Cargar datos geográficos
        this.cargarDatosGeograficos(formData.departamento, formData.distrito, formData.municipio);
        
        // Seleccionar tareas
        const tareasSelect = document.getElementById('activityTareas');
        if (tareasSelect) {
            Array.from(tareasSelect.options).forEach(option => {
                option.selected = formData.tareas.includes(option.value);
            });
        }
        
        document.getElementById('activityHombres').value = formData.participantesHombres;
        document.getElementById('activityMujeres').value = formData.participantesMujeres;
        document.getElementById('activityResultados').value = formData.resultados || '';
        document.getElementById('activityObservaciones').value = formData.observaciones || '';
    }

    llenarModalDetalles(actividad) {
        const fechaFormateada = new Date(actividad.fecha).toLocaleDateString('es-SV');
        
        document.getElementById('detailFecha').textContent = fechaFormateada;
        document.getElementById('detailActividad').textContent = actividad.actividad_nombre;
        document.getElementById('detailEstado').textContent = this.obtenerTextoEstado(actividad.estado);
        document.getElementById('detailEstado').className = `status-badge ${this.obtenerClaseEstado(actividad.estado)}`;
        document.getElementById('detailHoraInicio').textContent = actividad.H_inicio;
        document.getElementById('detailHoraFin').textContent = actividad.H_Fin;
        document.getElementById('detailRegion').textContent = actividad.region;
        document.getElementById('detailDepartamento').textContent = actividad.departamento;
        document.getElementById('detailMunicipio').textContent = actividad.municipio;
        document.getElementById('detailDistrito').textContent = actividad.distrito;
        document.getElementById('detailTecnico').textContent = `Usuario ${actividad.Id_Usuario}`;
        document.getElementById('detailUsuario').textContent = `Usuario ${actividad.Id_Usuario}`;
        
        // Mostrar tareas
        const tareasContainer = document.getElementById('detailTareas');
        if (tareasContainer) {
            tareasContainer.innerHTML = '';
            if (actividad.tarea) {
                const tareas = actividad.tarea.split(', ');
                tareas.forEach(tarea => {
                    const tareaElement = document.createElement('div');
                    tareaElement.className = 'tarea-item';
                    tareaElement.innerHTML = `<i class="fas fa-check-circle"></i> ${tarea}`;
                    tareasContainer.appendChild(tareaElement);
                });
            }
        }
        
        document.getElementById('detailHombres').textContent = actividad.hombres || 0;
        document.getElementById('detailMujeres').textContent = actividad.mujeres || 0;
        document.getElementById('detailResultados').textContent = actividad.resultados || 'No hay resultados registrados';
        document.getElementById('detailObservaciones').textContent = actividad.observaciones || 'No hay observaciones registradas';
        document.getElementById('detailFechaRegistro').textContent = fechaFormateada;
    }

    validarFormulario(formData) {
        if (!formData.fecha || !formData.actividad || !formData.departamento || !formData.region) {
            this.mostrarError('Error', 'Por favor complete todos los campos obligatorios');
            return false;
        }
        return true;
    }

    limpiarFormularioActividad() {
        const form = document.getElementById('activityForm');
        if (form) {
            form.reset();
            document.getElementById('activityId').value = '';
            document.getElementById('modalActivityTitle').textContent = 'Registrar Nueva Actividad';
            
            // Limpiar selects dependientes
            const distritoSelect = document.getElementById('activityDistrito');
            const municipioSelect = document.getElementById('activityMunicipio');
            const departamentoSelect = document.getElementById('activityDepartamento');
            if (distritoSelect) distritoSelect.innerHTML = '<option value="">Selecciona un distrito</option>';
            if (municipioSelect) municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
            if (departamentoSelect) departamentoSelect.innerHTML = '<option value="">Seleccione un departamento'
        }
    }

    aplicarFiltrosActividades() {
        // Por ahora recargamos todas las actividades
        // En una implementación completa, esto filtraría en el backend
        this.cargarActividades();
    }

    limpiarFiltros() {
        const filterDate = document.getElementById('filterDate');
        const filterActivity = document.getElementById('filterActivity');
        const filterRegion = document.getElementById('filterRegion');
        const filterStatus = document.getElementById('filterStatus');
        
        if (filterDate) filterDate.value = '';
        if (filterActivity) filterActivity.value = '';
        if (filterRegion) filterRegion.value = '';
        if (filterStatus) filterStatus.value = '';
        
        this.aplicarFiltrosActividades();
    }

    cargarDatosGeograficos(region, departamento = '', distritoSeleccionado = '', municipioSeleccionado = '') {
        const datos = window.datosGeograficos ? window.datosGeograficos[region?.toLowerCase()] : null;
        const distritoSelect = document.getElementById('activityDistrito');
        const municipioSelect = document.getElementById('activityMunicipio');
        const departamentoSelect = document.getElementById('activityDepartamento')
        
        if (datos && distritoSelect && municipioSelect && departamentoSelect) {
            //Cargar departamento
            departamentoSelect.innerHTML = '<option value="">Seleccione un departamento</option>';
            datos.departamentos.forEach(dep => {
                const option = document.createElement('option');
                option.value = dep;
                option.textContent = dep;
                option.selected = dep === departamentoSeleccionado;
                departamentoSelect.appendChild(option);
            });
            
            // Cargar distritos
            distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';
            datos.distritos.forEach(distrito => {
                const option = document.createElement('option');
                option.value = distrito;
                option.textContent = distrito;
                option.selected = distrito === distritoSeleccionado;
                distritoSelect.appendChild(option);
            });
            
            // Cargar municipios
            municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
            datos.municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio;
                option.textContent = municipio;
                option.selected = municipio === municipioSeleccionado;
                municipioSelect.appendChild(option);
            });
        } else if (distritoSelect && municipioSelect && departamentoSelect) {
            // Limpiar selects si no hay datos
            distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';
            municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
            departamentoSelect.innerHTML = '<option value="">Seleccione un departamento</option>';
        }
    }

    obtenerClaseEstado(estado) {
        switch(estado?.toLowerCase()) {
            case 'completada': return 'status-active';
            case 'en progreso': return 'status-pending';
            case 'pendiente': return 'status-inactive';
            case 'cancelada': return 'status-inactive';
            default: return 'status-inactive';
        }
    }

    obtenerTextoEstado(estado) {
        switch(estado?.toLowerCase()) {
            case 'completada': return 'Completada';
            case 'en progreso': return 'En Progreso';
            case 'pendiente': return 'Pendiente';
            case 'cancelada': return 'Cancelada';
            default: return estado || 'Desconocido';
        }
    }

    actualizarPaginacionActividades(totalItems) {
        const totalPages = Math.ceil(totalItems / this.pageSize);
        const showingStart = (this.currentPage * this.pageSize) + 1;
        const showingEnd = Math.min((this.currentPage + 1) * this.pageSize, totalItems);
        
        const fromElement = document.getElementById('activitiesFrom');
        const toElement = document.getElementById('activitiesTo');
        const totalElement = document.getElementById('activitiesTotal');
        
        if (fromElement) fromElement.textContent = showingStart;
        if (toElement) toElement.textContent = showingEnd;
        if (totalElement) totalElement.textContent = totalItems;
        
        this.actualizarControlesPaginacion('activitiesPagination', totalPages);
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
                this.cargarActividades();
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
                this.cargarActividades();
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
                this.cargarActividades();
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
                <td colspan="8" class="empty-state">
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
                <td colspan="8" class="empty-state">
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
const actividadController = new ActividadController();