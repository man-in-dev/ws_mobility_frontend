import api from './client';

export const Vehicle = {
    list: () => api.get('/vehicles'),
    get: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
};

export const ServiceRequest = {
    list: () => api.get('/service-requests'),
    get: (id) => api.get(`/service-requests/${id}`),
    create: (data) => api.post('/service-requests', data),
    update: (id, data) => api.put(`/service-requests/${id}`, data),
    delete: (id) => api.delete(`/service-requests/${id}`),
};

export const Inventory = {
    list: () => api.get('/inventory'),
    get: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
};

export const InventoryOrder = {
    list: () => api.get('/inventory-orders'),
    get: (id) => api.get(`/inventory-orders/${id}`),
    create: (data) => api.post('/inventory-orders', data),
    update: (id, data) => api.put(`/inventory-orders/${id}`, data),
    delete: (id) => api.delete(`/inventory-orders/${id}`),
};

export const InsuranceLead = {
    list: () => api.get('/insurance-leads'),
    get: (id) => api.get(`/insurance-leads/${id}`),
    create: (data) => api.post('/insurance-leads', data),
    update: (id, data) => api.put(`/insurance-leads/${id}`, data),
    delete: (id) => api.delete(`/insurance-leads/${id}`),
};

export const Payment = {
    list: () => api.get('/payments'),
    get: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
};

export const Commission = {
    list: () => api.get('/commissions'),
    get: (id) => api.get(`/commissions/${id}`),
    create: (data) => api.post('/commissions', data),
    update: (id, data) => api.put(`/commissions/${id}`, data),
    delete: (id) => api.delete(`/commissions/${id}`),
};

export const User = {
    register: (data) => api.post('/users/register', data, { auth: false }),
    login: async (data) => {
        const res = await api.post('/users/login', data, { auth: false });
        api.setToken(res.token);
        return res;
    },
    logout: () => api.clearToken(),
    me: () => api.get('/users/me'),
    list: () => api.get('/users'),
    update: (id, data) => api.put(`/users/${id}`, data),
    updateMyUserData: (data) => api.put('/users/me', data),
}; 