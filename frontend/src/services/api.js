import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const blogService = {
    generateBlog: async (data) => {
        const response = await api.post('/generate-blog', data);
        return response.data;
    },
    getBlogs: async () => {
        const response = await api.get('/blogs');
        return response.data;
    },
    getBlogById: async (id) => {
        const response = await api.get(`/blogs/${id}`);
        return response.data;
    },
    publishToDevTo: async (id, devtoApiKey) => {
        const response = await api.post(`/blogs/${id}/publish-devto`, { devto_api_key: devtoApiKey });
        return response.data;
    },
    downloadBlog: (blog) => {
        const slug = blog.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
        const blob = new Blob([blog.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.md`;
        a.click();
        URL.revokeObjectURL(url);
    },
};

export default api;

