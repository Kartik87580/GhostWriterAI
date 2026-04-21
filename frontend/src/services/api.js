import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
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
};

export default api;
