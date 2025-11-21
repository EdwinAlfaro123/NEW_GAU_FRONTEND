// JS/services/actividadService.js
class ActividadService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiActividad';
    }

async getAllActividades(page = 0, size = 10) {
    try {
        const response = await fetch(`${this.baseURL}/getAllActividades?page=${page}&size=${size}`);

        if (!response.ok) {
            // Si el backend devuelve 204 o error sin cuerpo
            if (response.status === 204) {
                return { content: [], totalElements: 0 };
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Leemos el body como texto porque a veces viene vacío
        const raw = await response.text();

        if (!raw || raw.trim() === "") {
            return { content: [], totalElements: 0 };
        }

        return JSON.parse(raw);

    } catch (error) {
        console.error("Error al obtener actividades:", error);
        return { content: [], totalElements: 0 }; // evitar que reviente dashboard.js
    }
}



    // Crear nueva actividad
    async createActividad(actividadData) {
        try {
            const response = await fetch(`${this.baseURL}/newActividad`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actividadData)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('Error al crear actividad:', error);
            throw error;
        }
    }

    // Actualizar actividad existente
    async updateActividad(id, actividadData) {
        try {
            const response = await fetch(`${this.baseURL}/updateActividad/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actividadData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar actividad:', error);
            throw error;
        }
    }

    // Eliminar actividad
    async deleteActividad(id) {
        try {
            const response = await fetch(`${this.baseURL}/deleteActividad/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
            throw error;
        }
    }

    // Convertir datos del formulario al formato DTO
    convertirFormDataADTO(formData) {
        return {
            estado: formData.estado,
            fecha: formData.fecha,
            h_inicio: formData.horaInicio,
            h_Fin: formData.horaFin,
            region: formData.region,
            departamento: formData.departamento,
            municipio: formData.municipio,
            distrito: formData.distrito,
            actividad_nombre: formData.actividad,
            tarea: Array.isArray(formData.tareas) ? formData.tareas.join(', ') : formData.tareas,
            hombres: parseInt(formData.participantesHombres) || 0,
            mujeres: parseInt(formData.participantesMujeres) || 0,
            resultados: formData.resultados,
            observaciones: formData.observaciones,
            respaldo: formData.respaldo || null,
            Id_Usuario: this.obtenerUsuarioActualId() // Obtener ID del usuario logueado
        };
    }

    // Convertir DTO a datos del formulario
    convertirDTOAFormData(actividadDTO) {
    return {
        id: actividadDTO.id,
        estado: actividadDTO.estado,
        fecha: actividadDTO.fecha,
        horaInicio: actividadDTO.H_inicio,
        horaFin: actividadDTO.H_Fin,
        region: actividadDTO.region,
        departamento: actividadDTO.departamento,
        municipio: actividadDTO.municipio,
        distrito: actividadDTO.distrito,
        actividad: actividadDTO.actividad_nombre,
        tareas: Array.isArray(actividadDTO.tareas) ? actividadDTO.tareas : [],
        hombres: actividadDTO.hombres,
        mujeres: actividadDTO.mujeres,
        resultados: actividadDTO.resultados,
        observaciones: actividadDTO.observaciones,
        respaldo: actividadDTO.respaldo
    };
}

    // Obtener ID del usuario actual (simulado - en producción vendría del token/auth)
    obtenerUsuarioActualId() {
        // Por ahora retornamos 1 como usuario por defecto
        // En producción esto debería venir del sistema de autenticación
        return 1;
    }
}