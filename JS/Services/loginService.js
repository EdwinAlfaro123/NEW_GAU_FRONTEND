// ======================================================================
// LoginService.js - Funcionando con tu API Spring Boot REAL
// ======================================================================

const API_BASE = "http://localhost:8080/auth";

const LOGIN_URL  = `${API_BASE}/login`;
const LOGOUT_URL = `${API_BASE}/logout`;
const ME_URL     = `${API_BASE}/me`;

const TOKEN_KEY  = "authToken";
const USER_KEY   = "userData";

// ======================================================================
// TOKEN & USER
// ======================================================================
export function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
export function getToken(){ return localStorage.getItem(TOKEN_KEY); }
export function clearToken(){ localStorage.removeItem(TOKEN_KEY); }

export function setUsuario(u){
    localStorage.setItem(USER_KEY, JSON.stringify(u));
}
export function getUsuario(){
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
}
export function clearUsuario(){ localStorage.removeItem(USER_KEY); }

// ======================================================================
// INTERCEPTOR -> AGREGA BEARER TOKEN Y ENVÍA COOKIE JWT DEL BACK
// ======================================================================
let patched = false;

export function attachAuthInterceptor() {
    if (patched) return;
    patched = true;

    const original = window.fetch;

    window.fetch = async (input, init = {}) => {
        const h = new Headers(init.headers || {});
        const token = getToken();

        if (token) {
            h.set("Authorization", `Bearer ${token}`);
        }

        init.headers = h;
        init.credentials = "include"; // ENVÍA COOKIE httpOnly DEL BACKEND

        const res = await original(input, init);

        if (res.status === 401) {
            clearToken();
            clearUsuario();
            window.location.href = "../Autenticacion/login.html";
        }

        return res;
    };
}

// ======================================================================
// LOGIN
// ======================================================================
export async function login(email, pass) {

    const body = { email, pass };

    const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(()=>({}));

    if (!res.ok) {
        throw new Error(data?.message || "Credenciales incorrectas");
    }

    // back devuelve: status, token, user{ id, nombre, email, rol, unidad }
    if (data.token) setToken(data.token);
    if (data.user) setUsuario(data.user);

    return data;
}

// ======================================================================
// ME
// ======================================================================
export async function checkAuth(){
    const res = await fetch(ME_URL, { credentials: "include" });

    if (!res.ok) return null;

    return res.json();
}

// ======================================================================
// LOGOUT
// ======================================================================
export async function logout(){
    await fetch(LOGOUT_URL, {
        method: "POST",
        credentials: "include"
    });

    clearToken();
    clearUsuario();

    window.location.href = "../Autenticacion/login.html";
}

// ======================================================================
export function isLoggedIn(){ return !!getToken(); }
export function getUsuarioLogueado(){ return getUsuario(); }
