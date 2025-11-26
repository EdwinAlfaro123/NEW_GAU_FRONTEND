class ActividadService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiActividad';
    }

    async getAllActividades(page = 0, size = 10) {
        try {
            const response = await fetch(`${this.baseURL}/getAllActividades?page=${page}&size=${size}`);

            if (!response.ok) {
                if (response.status === 204) {
                    return { content: [], totalElements: 0 };
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const raw = await response.text();
            if (!raw || raw.trim() === "") {
                return { content: [], totalElements: 0 };
            }

            return JSON.parse(raw);

        } catch (error) {
            console.error("Error al obtener actividades:", error);
            return { content: [], totalElements: 0 };
        }
    }

    async createActividad(actividadData) {

        console.log("📤 Enviando JSON al backend:", actividadData);

        try {
            const response = await fetch(`${this.baseURL}/newActividad`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(actividadData)
            });

            const text = await response.text();

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('❌ Error al crear actividad:', error);
            throw error;
        }
    }

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

    // ✔ DTO CORRECTO
    convertirFormDataADTO(formData) {
        return {
            id: formData.id || null,

            // ✔ CAMPOS OBLIGATORIOS
            actividad_nombre: formData.actividad,      // <--- ESTE FALTABA
            estado: formData.estado,
            fecha: formData.fecha,

            H_inicio: formData.horaInicio,
            H_Fin: formData.horaFin,

            // ✔ DATOS DE UBICACIÓN
            region: formData.region,
            departamento: formData.departamento,
            municipio: formData.municipio,
            distrito: formData.distrito,

            // ✔ EL BACKEND USA actividad_tipo
            actividad_tipo: formData.tipoActividad,

            // ✔ TAREAS DEBE SER LISTA
            tareas: formData.tareas ? formData.tareas.split(",").map(t => t.trim()) : [],

            hombres: parseInt(formData.participantesHombres) || 0,
            mujeres: parseInt(formData.participantesMujeres) || 0,

            resultados: formData.resultados,
            observaciones: formData.observaciones,

            respaldo: formData.respaldo || "UNU",

            Id_Usuario: this.obtenerUsuarioActualId()
        };
    }

    convertirDTOAFormData(actividadDTO) {
        return {
            id: actividadDTO.id,
            actividad: actividadDTO.actividad_nombre,
            estado: actividadDTO.estado,
            fecha: actividadDTO.fecha,
            horaInicio: actividadDTO.H_inicio,
            horaFin: actividadDTO.H_Fin,
            region: actividadDTO.region,
            departamento: actividadDTO.departamento,
            municipio: actividadDTO.municipio,
            distrito: actividadDTO.distrito,
            tipoActividad: actividadDTO.actividad_tipo,
tareas: actividadDTO.tareas || [], 
            hombres: actividadDTO.hombres,
            mujeres: actividadDTO.mujeres,
            resultados: actividadDTO.resultados,
            observaciones: actividadDTO.observaciones,
            respaldo: actividadDTO.respaldo
        };
    }
}
