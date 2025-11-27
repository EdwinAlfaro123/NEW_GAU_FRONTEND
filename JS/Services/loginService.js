const API_BASE = "http://localhost:8080/auth";

const LOGIN_URL  = `${API_BASE}/login`;
const LOGOUT_URL = `${API_BASE}/logout`;
const ME_URL     = `${API_BASE}/me`;

const TOKEN_KEY  = "authToken";
const USER_KEY   = "userData";

export function setToken(token){ localStorage.setItem(TOKEN_KEY, token); }
export function getToken(){ return localStorage.getItem(TOKEN_KEY); }
export function clearToken(){ localStorage.removeItem(TOKEN_KEY); }

export function setUsuario(usuario){ localStorage.setItem(USER_KEY, JSON.stringify(usuario)); }
export function getUsuario(){
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
}
export function clearUsuario(){ localStorage.removeItem(USER_KEY); }

let patched = false;

export function attachAuthInterceptor() {
    if (patched) return;
    patched = true;

    const originalFetch = window.fetch;

    window.fetch = async (input, init = {}) => {
        const headers = new Headers(init.headers || {});
        const token = getToken();

        if (token) headers.set("Authorization", `Bearer ${token}`);

        init.headers = headers;
        init.credentials = "include";

        const res = await originalFetch(input, init);

        if (res.status === 401) {
            clearToken();
            clearUsuario();
            window.location.href = "../Autenticacion/login.html";
        }

        return res;
    };
}

export async function login(email, pass) {
    const body = { email, password: pass };

    const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(()=>({}));

    if (!res.ok) throw new Error(data?.message || "Credenciales incorrectas");

    if (data.token) setToken(data.token);
    if (data.user) setUsuario(data.user);

    return data;
}

export async function checkAuth() {
    const res = await fetch(ME_URL, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
}

export async function logout() {
    await fetch(LOGOUT_URL, { method: "POST", credentials: "include" });
    clearToken();
    clearUsuario();
    window.location.href = "../Autenticacion/login.html";
}

export function isLoggedIn(){ return !!getToken(); }
export function getUsuarioLogueado(){ return getUsuario(); }
