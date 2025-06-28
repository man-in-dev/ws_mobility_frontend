import api from './client';

export const Core = {
    InvokeLLM: (prompt) => api.post('/integrations/llm', { prompt }),
    SendEmail: (to, subject, text) => api.post('/integrations/send-email', { to, subject, text }),
    UploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/integrations/upload-file`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${api.getToken()}`,
            },
            body: formData,
        }).then(res => res.json());
    },
    GenerateImage: (prompt) => api.post('/integrations/generate-image', { prompt }),
    ExtractDataFromUploadedFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/integrations/extract-data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${api.getToken()}`,
            },
            body: formData,
        }).then(res => res.json());
    },
}; 