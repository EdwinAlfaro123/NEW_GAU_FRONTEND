// JS/services/usuarioService.js
class UsuarioService {
    constructor() {
        this.baseURL = 'http://localhost:8080/apiUsuario';
        this.maxPageSize = 50; // máximo permitido por backend
    }

    // ============================
    // 🔹 OBTENER USUARIOS (GET)
    // ============================
    async getAllUsuarios(page = 0, size = 10) {
        try {
            // Limitar size al máximo permitido
            if (size > this.maxPageSize) size = this.maxPageSize;

            const url = `${this.baseURL}/getAllUsuarios?page=${page}&size=${size}`;
            const response = await fetch(url);

            if (!response.ok) {
                // Traer mensaje del backend si es 400
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : { content: [] }; // prevenir JSON vacío

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    // ============================
    // 🔹 OBTENER USUARIO POR ID (GET)
    // ============================
    async getUsuarioById(id) {
        try {
            const url = `${this.baseURL}/getUsuario/${id}`;
            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            throw error;
        }
    }

    // ============================
    // 🔹 CREAR USUARIO (POST)
    // ============================
    async createUsuario(usuarioData) {
        try {
            const response = await fetch(`${this.baseURL}/newUsuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioData)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    // ============================
    // 🔹 ACTUALIZAR USUARIO (PUT)
    // ============================
    async updateUsuario(id, usuarioData) {
        try {
            const response = await fetch(`${this.baseURL}/updateUsuario/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioData)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // ============================
    // 🔹 ELIMINAR USUARIO (DELETE)
    // ============================
    async deleteUsuario(id) {
        try {
            const response = await fetch(`${this.baseURL}/deleteUsuario/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error ${response.status}: ${text || response.statusText}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : true;

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }

    // ============================
    // 🔹 CONVERTIR FORMULARIO → DTO
    // ============================
    convertirFormDataADTO(formData) {
        return {
            id: formData.id || null,
            nombre: formData.nombres,
            telefono: formData.telefono,
            email: formData.email,
            unidad: formData.unidad,
            pass: formData.password,
            rol: formData.rol,
            region: formData.region,
            departamento: formData.departamento,
            municipio: formData.municipio,
            distrito: formData.distrito,
            filtrar: formData.filtrado || 'No Aplica'
        };
    }

    // ============================
    // 🔹 CONVERTIR DTO → FORMULARIO
    // ============================
    convertirDTOAFormData(usuarioDTO) {
        return {
            id: usuarioDTO.id,
            nombres: usuarioDTO.nombre,
            telefono: usuarioDTO.telefono,
            email: usuarioDTO.email,
            unidad: usuarioDTO.unidad,
            password: usuarioDTO.pass,
            rol: usuarioDTO.rol,
            region: usuarioDTO.region,
            departamento: usuarioDTO.departamento,
            municipio: usuarioDTO.municipio,
            distrito: usuarioDTO.distrito,
            filtrado: usuarioDTO.filtrar || 'No Aplica'
        };
    }
}
