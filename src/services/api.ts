import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, Student, Event, Group } from '../types';

// URL du backend sur VPS avec HTTPS
const API_BASE_URL = 'https://www.ggdanceacademy.com/api';

// Instance Axios avec intercepteur pour le token
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// ===== AUTHENTIFICATION =====
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Backend utilise 'identifier' (email) et 'password' (téléphone)
    const { data } = await api.post('/login', { identifier: email, password });
    // data contient directement l'user (pas de token JWT)
    const user = data;
    await AsyncStorage.setItem('auth_token', user.phone || user.id);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return { token: user.phone, user, students: [] };
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['auth_token', 'user']);
  },

  getCurrentUser: async (): Promise<{ token: string; user: any } | null> => {
    const token = await AsyncStorage.getItem('auth_token');
    const userStr = await AsyncStorage.getItem('user');
    if (!token || !userStr) return null;
    return { token, user: JSON.parse(userStr) };
  },
};

// ===== ÉTUDIANTS (ENFANTS) =====
export const studentService = {
  getByParent: async (parentPhone: string): Promise<Student[]> => {
    // Récupérer tous les students et filtrer par parent_phone
    const { data } = await api.get<any[]>('/students');
    return data.filter((s: any) => s.parentId === parentPhone);
  },

  getById: async (studentId: number): Promise<Student> => {
    const { data } = await api.get<Student>(`/students/${studentId}`);
    return data;
  },
};

// ===== ÉVÉNEMENTS =====
export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const { data } = await api.get<Event[]>('/events');
    return data;
  },

  register: async (eventId: number, studentIds: number[]): Promise<void> => {
    await api.post(`/events/${eventId}/register`, { studentIds });
  },
};

// ===== GROUPES =====
export const groupService = {
  getAll: async (): Promise<Group[]> => {
    const { data } = await api.get<Group[]>('/groups');
    return data;
  },
};

// ===== PAIEMENTS =====
export const paymentService = {
  getByStudent: async (studentId: number) => {
    const { data } = await api.get(`/payments/student/${studentId}`);
    return data;
  },
};

// ===== PRODUITS / BOUTIQUE =====
export const productService = {
  getAll: async () => {
    const { data } = await api.get('/products');
    return data;
  },

  order: async (productId: string, studentCode: string, quantity: number = 1) => {
    const { data } = await api.post(`/products/${productId}/order`, {
      studentCode,
      quantity,
    });
    return data;
  },

  reserve: async (productId: string, studentCode: string, quantity: number = 1) => {
    const { data } = await api.post(`/products/${productId}/order`, {
      studentCode,
      quantity,
    });
    return data;
  },
};

// ===== INSCRIPTIONS AUX ÉVÉNEMENTS =====
export const registrationService = {
  getByParent: async (parentPhone: string) => {
    const { data } = await api.get(`/registrations/parent/${parentPhone}`);
    return data;
  },

  getByStudent: async (studentId: number) => {
    const { data } = await api.get(`/registrations/student/${studentId}`);
    return data;
  },
};

// ===== IMAGES =====
export const imageService = {
  getLogo: async (): Promise<string | null> => {
    try {
      const { data } = await api.get('/images');
      const logoImage = data.find((img: any) => img.key === 'logo');
      if (logoImage && logoImage.url) {
        // Construire l'URL complète si c'est un chemin relatif
        return logoImage.url.startsWith('/') 
          ? `http://141.227.133.61:3000${logoImage.url}`
          : logoImage.url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return null;
    }
  },

  getImageByKey: async (key: string): Promise<string | null> => {
    try {
      const { data } = await api.get('/images');
      const image = data.find((img: any) => img.key === key);
      return image ? image.url : null;
    } catch (error) {
      console.error(`Error fetching image ${key}:`, error);
      return null;
    }
  },

  getUrl: (path: string | undefined): string => {
    if (!path) return 'https://placehold.co/400x400/1e293b/d97706?text=Image';
    if (path.startsWith('http')) return path;
    return `http://141.227.133.61:3000${path}`;
  },
};

// ===== MESSAGES PARENTS =====
export const messageService = {
  getByParent: async (parentPhone: string) => {
    try {
      const { data } = await api.get(`/parent-messages/parent/${parentPhone}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching parent messages:', error);
      return [];
    }
  },

  markAsRead: async (messageId: number) => {
    await api.put(`/parent-messages/${messageId}/read`);
  },

  getUnreadCount: async (parentPhone: string): Promise<number> => {
    try {
      const messages = await messageService.getByParent(parentPhone);
      return messages.filter((msg: any) => !msg.is_read).length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
};

// Export de l'instance pour usage direct si nécessaire
export default api;
