// Parte del modulo de logistica para las rutas y entregas.

import axiosInstance from './axiosConfig';

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  año: number | null;
  capacidad_carga_kg: string;
  activo: boolean;
}

export interface PedidoRuta {
  id: number;
  pedido: number;
  pedido_codigo: string;
  orden_entrega: number;
  hora_llegada: string | null;
  hora_salida: string | null;
  entregado: boolean;
  receptor_nombre: string;
  observaciones_entrega: string;
}

export interface RutaEntrega {
  id: number;
  codigo_ruta: string;
  nombre_ruta: string;
  tecnico_campo: number;
  tecnico_nombre: string;
  vehiculo: number | null;
  vehiculo_detalle: Vehiculo | null;
  fecha_planificada: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
  departamento: number;
  departamento_nombre: string;
  observaciones: string;
  pedidos: PedidoRuta[];
  total_pedidos: number;
  pedidos_entregados: number;
}

export interface CreateRutaRequest {
  nombre_ruta: string;
  tecnico_campo: number;
  vehiculo?: number;
  fecha_planificada: string;
  departamento: number;
  observaciones?: string;
  pedidos_ids: number[];
}

export interface EstadisticasLogistica {
  rutas_activas: number;
  pedidos_sin_asignar: number;
  entregas_completadas_hoy: number;
  vehiculos_disponibles: number;
  total_vehiculos: number;
}

export const logisticaService = {
  // Rutas
  getRutas: async (): Promise<RutaEntrega[]> => {
    const response = await axiosInstance.get<RutaEntrega[]>('/rutas/');
    return response.data;
  },

  getRutaById: async (id: number): Promise<RutaEntrega> => {
    const response = await axiosInstance.get<RutaEntrega>(`/rutas/${id}/`);
    return response.data;
  },

  createRuta: async (data: CreateRutaRequest): Promise<RutaEntrega> => {
    const response = await axiosInstance.post<RutaEntrega>('/rutas/', data);
    return response.data;
  },

  updateRutaEstado: async (id: number, estado: string): Promise<RutaEntrega> => {
    const response = await axiosInstance.patch<RutaEntrega>(`/rutas/${id}/`, { estado });
    return response.data;
  },

  deleteRuta: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/rutas/${id}/`);
  },

  // Vehículos
  getVehiculos: async (): Promise<Vehiculo[]> => {
    const response = await axiosInstance.get<Vehiculo[]>('/vehiculos/');
    return response.data;
  },

  getVehiculosDisponibles: async (): Promise<Vehiculo[]> => {
    const response = await axiosInstance.get<Vehiculo[]>('/vehiculos/?activo=true');
    return response.data;
  },

  createVehiculo: async (data: Partial<Vehiculo>): Promise<Vehiculo> => {
    const response = await axiosInstance.post<Vehiculo>('/vehiculos/', data);
    return response.data;
  },

  // Estadísticas
  getEstadisticas: async (): Promise<EstadisticasLogistica> => {
    const response = await axiosInstance.get<EstadisticasLogistica>('/rutas/estadisticas/');
    return response.data;
  },

  // Pedidos sin asignar
  getPedidosDisponibles: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/pedidos/?estado=listo_entrega&sin_ruta=true');
    return response.data;
  },
};