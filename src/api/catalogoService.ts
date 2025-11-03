// src/api/catalogoService.ts
import axiosInstance from './axiosConfig';
import type { CatalogoPilon, CategoriaPlanta, PaginatedResponse } from '../types';

export const catalogoService = {
  // Listar todas las plantas
  getAllPlantas: async (params?: {
    page?: number;
    search?: string;
    categoria?: number;
  }): Promise<PaginatedResponse<CatalogoPilon>> => {
    const response = await axiosInstance.get<PaginatedResponse<CatalogoPilon>>('/catalogo/', {
      params,
    });
    return response.data;
  },

  // Obtener plantas disponibles
  getPlantasDisponibles: async (): Promise<CatalogoPilon[]> => {
    const response = await axiosInstance.get<CatalogoPilon[]>('/catalogo/disponibles/');
    return response.data;
  },

  // Obtener plantas con stock bajo
  getPlantasStockBajo: async (): Promise<CatalogoPilon[]> => {
    const response = await axiosInstance.get<CatalogoPilon[]>('/catalogo/stock-bajo/');
    return response.data;
  },

  // Obtener detalle de una planta
  getPlantaById: async (id: number): Promise<CatalogoPilon> => {
    const response = await axiosInstance.get<CatalogoPilon>(`/catalogo/${id}/`);
    return response.data;
  },

  // Crear nueva planta (solo admin)
  createPlanta: async (data: Partial<CatalogoPilon>): Promise<CatalogoPilon> => {
    const response = await axiosInstance.post<CatalogoPilon>('/catalogo/', data);
    return response.data;
  },

  // Actualizar planta
  updatePlanta: async (id: number, data: Partial<CatalogoPilon>): Promise<CatalogoPilon> => {
    const response = await axiosInstance.patch<CatalogoPilon>(`/catalogo/${id}/`, data);
    return response.data;
  },

  // Eliminar planta
  deletePlanta: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/catalogo/${id}/`);
  },

  // Obtener categorías
  getCategorias: async (): Promise<CategoriaPlanta[]> => {
    const response = await axiosInstance.get<CategoriaPlanta[]>('/categorias/');
    return response.data;
  },
};