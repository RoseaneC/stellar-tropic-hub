import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { nickname: string; password: string; public_key?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { nickname: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Timeline API
export const timelineAPI = {
  getPosts: (page: number = 1) => api.get(`/timeline?page=${page}`),
  
  createPost: (data: { content: string; image?: string }) =>
    api.post('/timeline/posts', data),
  
  likePost: (postId: string) => api.post(`/timeline/posts/${postId}/like`),
  
  commentPost: (postId: string, content: string) =>
    api.post(`/timeline/posts/${postId}/comments`, { content }),
};

// Missions API
export const missionsAPI = {
  getMissions: () => api.get('/missions'),
  
  completeMission: (missionId: string) => api.post(`/missions/${missionId}/complete`),
  
  getUserProgress: () => api.get('/missions/progress'),
};

// Ranking API
export const rankingAPI = {
  getGlobalRanking: (page: number = 1) => api.get(`/ranking?page=${page}`),
  
  getUserRanking: () => api.get('/ranking/me'),
};

// Chat API
export const chatAPI = {
  getMessages: (chatId?: string, page: number = 1) => 
    api.get(`/chat/messages${chatId ? `/${chatId}` : ''}?page=${page}`),
  
  sendMessage: (data: { content: string; chat_id?: string; recipient_id?: string }) =>
    api.post('/chat/messages', data),
  
  getChats: () => api.get('/chat/rooms'),
};

export default api;