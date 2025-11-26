// =====================================================
// IMPORTS
// =====================================================
import { login, getUsuarioLogueado } from "../Services/loginService.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogueado();

  // Si ya existe sesión → ir al dashboard
  if (usuario) {
    window.location.href = "../dashboard/index.html";
    return;
  }

  initTogglePassword();
  initLogin();
});

// =====================================================
// INIT LOGIN
// =====================================================
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
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span> Verificando...
    `;

    try {
      // Llamada al servicio real
      const r = await login(email, pass);

      console.log(">>> RESPUESTA DEL BACKEND:", r);

      // El backend devuelve: { status, token, user:{...} }
      const user = r.user || r.data; // Ajusta según tu backend
      const nombre = user?.nombreUsuario || user?.nombre || user?.correo || "Usuario";

      Swal.fire({
        icon: "success",
        title: "Inicio exitoso",
        text: `Bienvenido ${nombre}`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "../dashboard/index.html";
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

// =====================================================
// TOGGLE PASSWORD
// =====================================================
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
