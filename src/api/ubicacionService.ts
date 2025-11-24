//ubicacionService
import axiosInstance from './axiosConfig';
import type { Departamento, Municipio } from '../types';

export const ubicacionService = {
  // Obtener todos los departamentos
  getDepartamentos: async (): Promise<Departamento[]> => {
    const response = await axiosInstance.get<Departamento[]>('/departamentos/');
    return response.data;
  },

  // Obtener departamento por ID
  getDepartamentoById: async (id: number): Promise<Departamento> => {
    const response = await axiosInstance.get<Departamento>(`/departamentos/${id}/`);
    return response.data;
  },

  // Obtener todos los municipios
  getMunicipios: async (): Promise<Municipio[]> => {
    const response = await axiosInstance.get<Municipio[]>('/municipios/');
    return response.data;
  },

  // Obtener municipios por departamento
  getMunicipiosByDepartamento: async (departamentoId: number): Promise<Municipio[]> => {
    const response = await axiosInstance.get<Municipio[]>('/municipios/', {
      params: { departamento: departamentoId },
    });
    return response.data;
  },

  // Obtener municipio por ID
  getMunicipioById: async (id: number): Promise<Municipio> => {
    const response = await axiosInstance.get<Municipio>(`/municipios/${id}/`);
    return response.data;
  },
};