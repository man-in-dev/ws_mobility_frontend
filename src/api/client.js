const API_BASE_URL = 'https://ws-mobility-backend-git-main-manmeet-kumars-projects.vercel.app/api';

function getToken() {
    return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
    const opts = { method, headers: { ...headers } };
    if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    if (auth) {
        const token = getToken();
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, opts);
    if (!res.ok) throw new Error((await res.json()).error || 'API error');
    return res.json();
}

export default {
    get: (path, opts) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
    put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
    delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
    setToken: (token) => localStorage.setItem('token', token),
    clearToken: () => localStorage.removeItem('token'),
    getToken,
}; 