// JS/Controllers/loginController.js
import { login } from "../Services/loginService.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogueado();

  console.log("Usuario en localStorage:", usuario); // Depuración

  // Redirige solo si usuario existe y tiene email válido
  if (usuario && usuario.email) {
    window.location.href = "dashboard.html"; // Ajusta la ruta si es necesario
    return;
  }

  initTogglePassword();
  initLogin();
});

// ======================================================
// Inicializa el formulario de login
// ======================================================
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("usuario")?.value.trim();
    const pass = document.getElementById("password")?.value;
    const btn = document.getElementById("loginButton");

    if (!email || !pass) {
      Swal.fire("Campos requeridos", "Completa todos los campos", "warning");
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Verificando...`;

    try {
      const response = await login(email, pass);

      console.log(">>> RESPUESTA DEL BACKEND:", response);

      if (!response.user) {
        throw new Error("Usuario no encontrado");
      }

      const user = response.user;
      // Guardamos la sesión en localStorage
      localStorage.setItem("usuario", JSON.stringify(user));

      Swal.fire({
        icon: "success",
        title: "Inicio exitoso",
        text: `Bienvenido ${user.email || "Usuario"}`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "dashboard.html";
      });

    } catch (err) {
      console.error(">>> ERROR BACKEND:", err);
      Swal.fire(
        "Error al iniciar sesión",
        err.message || "No se pudo iniciar sesión",
        "error"
      );
    } finally {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  });
}

// ======================================================
// Toggle de contraseña
// ======================================================
function initTogglePassword() {
  const btn = document.getElementById("btnTogglePwd");
  const input = document.getElementById("password");
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const icon = btn.querySelector("i");
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
}

// ======================================================
// Función para obtener usuario de localStorage
// ======================================================
export function getUsuarioLogueado() {
  const u = localStorage.getItem("usuario");
  if (!u) return null;

  try {
    return JSON.parse(u);
  } catch (err) {
    console.error("Error parseando usuario en localStorage:", err);
    return null;
  }
}

// ======================================================
// Función para limpiar sesión manual (opcional)
// ======================================================
export function clearUsuarioLogueado() {
  localStorage.removeItem("usuario");
}
