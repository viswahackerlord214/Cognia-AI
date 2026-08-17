import axios from 'axios';
import { UserProfile } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cognia_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, role?: string) => {
    const res = await api.post('/api/auth/login', { email, role });
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/api/me');
    return res.data as UserProfile;
  },
  getProfile: async () => {
    const res = await api.get('/api/me');
    return res.data as UserProfile;
  },
  getNotifications: async () => {
    try {
      const res = await api.get('/api/notifications');
      return res.data;
    } catch {
      return [];
    }
  },
  markNotificationRead: async (id: string) => {
    try {
      const res = await api.post(`/api/notifications/${id}/read`);
      return res.data;
    } catch {
      return { success: true };
    }
  },
  logout: async () => {
    localStorage.removeItem('cognia_auth_token');
  },
};

export const documentApi = {
  listDocuments: async () => {
    const res = await api.get('/api/documents');
    return res.data;
  },
  uploadDocument: async (formData: FormData) => {
    const res = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteDocument: async (docId: string) => {
    const res = await api.delete(`/api/documents/${docId}`);
    return res.data;
  },
};

export const docApi = documentApi;

export const adminApi = {
  getUsers: async (statusFilter?: string, roleFilter?: string) => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (roleFilter) params.append('role', roleFilter);
    const res = await api.get(`/api/admin/users?${params.toString()}`);
    return res.data;
  },
  approveUser: async (userId: string, role?: string) => {
    const res = await api.post(`/api/admin/users/${userId}/approve`, { assigned_role: role });
    return res.data;
  },
  rejectUser: async (userId: string) => {
    const res = await api.post(`/api/admin/users/${userId}/reject`);
    return res.data;
  },
  suspendUser: async (userId: string) => {
    const res = await api.post(`/api/admin/users/${userId}/suspend`);
    return res.data;
  },
};

export const ragApi = {
  chat: async (
    query: string,
    mode: 'docs' | 'web' = 'docs',
    history: Array<{ role: string; content: string }> = [],
    conversation_id?: string
  ) => {
    const res = await api.post('/api/chat', { query, mode, history, conversation_id });
    return res.data;
  },
  getConversations: async () => {
    const res = await api.get('/api/chat/conversations');
    return res.data.conversations;
  },
  getMessages: async (conversationId: string) => {
    const res = await api.get(`/api/chat/conversations/${conversationId}/messages`);
    return res.data.messages;
  },
  deleteConversation: async (conversationId: string) => {
    const res = await api.delete(`/api/chat/conversations/${conversationId}`);
    return res.data;
  },
  renameConversation: async (conversationId: string, title: string) => {
    const res = await api.patch(`/api/chat/conversations/${conversationId}`, { title });
    return res.data;
  },
  teachMe: async (course: string, topic: string) => {
    const res = await api.post('/api/teach', { course, topic });
    return res.data;
  },
  searchPyqs: async (course: string, query: string, semester: number = 5) => {
    const res = await api.post('/api/pyq/search', { course, query, semester });
    return res.data;
  },
  analyzePyqs: async (course: string) => {
    const res = await api.post('/api/pyq/analyze', { course });
    return res.data;
  },
};

export const quizApi = {
  generateQuiz: async (payload: { course: string; topic: string; num_questions: number; difficulty: string }) => {
    const res = await api.post('/api/quizzes/generate', payload);
    return res.data;
  },
  listQuizzes: async (course?: string, semester?: number) => {
    const params = new URLSearchParams();
    if (course) params.append('course', course);
    if (semester) params.append('semester', semester.toString());
    const res = await api.get(`/api/quizzes?${params.toString()}`);
    return res.data;
  },
  getQuizDetails: async (quizId: string) => {
    const res = await api.get(`/api/quizzes/${quizId}`);
    return res.data;
  },
  submitAttempt: async (quizId: string, answers: Record<string, string>) => {
    const res = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },
  submitQuizAttempt: async (quizId: string, answers: Record<string, string>) => {
    const res = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },
  publishQuiz: async (quizId: string, payload?: any) => {
    const res = await api.post(`/api/quizzes/${quizId}/publish`, payload);
    return res.data;
  },
  getQuizResults: async (quizId: string) => {
    const res = await api.get(`/api/quizzes/${quizId}/results`);
    return res.data;
  },
};
