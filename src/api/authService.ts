// src/api/authService.ts
import axiosInstance from './axiosConfig';
import type { LoginRequest, LoginResponse, Usuario, RegisterData } from '../types';


export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  // Registro
  register: async (userData: RegisterData): Promise<any> => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await axiosInstance.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // Obtener perfil del usuario actual
  getProfile: async (): Promise<Usuario> => {
    const response = await axiosInstance.get<Usuario>('/usuarios/me/');
    return response.data;
  },
};