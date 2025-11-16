// Frontend/src/api/logisticaService.ts
import axiosInstance from './axiosConfig';

export interface Vehiculo {
  id: number;
  placa: string;
  tipo: 'camion' | 'pickup' | 'panel';
  marca: string;
  modelo: string;
  año: number | null;
  capacidad_carga_kg: string;
  capacidad_volumen_m3: string | null;
  largo_m: string | null;
  ancho_m: string | null;
  alto_m: string | null;
  transportista: number | null;
  transportista_nombre?: string;
  observaciones: string;
  activo: boolean;
  dimensiones_str?: string;
}

export interface Transportista {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  nit: string;
  observaciones: string;
  activo: boolean;
}

export interface PuntoSiembra {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  departamento: number;
  departamento_nombre: string;
  municipio: number;
  municipio_nombre: string;
  aldea_colonia: string;
  referencia_ubicacion: string;
  activo: boolean;
}

export interface Finca {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  departamento: number;
  departamento_nombre: string;
  municipio: number;
  municipio_nombre: string;
  aldea_colonia: string;
  direccion_completa: string;
  referencia_ubicacion: string;
  usuario: number | null;
  usuario_nombre?: string;
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
  peso_estimado_kg: string;
  volumen_estimado_m3: string;
  prioridad: number;
}

export interface RutaEntrega {
  id: number;
  codigo_ruta: string;
  nombre_ruta: string;
  tecnico_campo: number;
  tecnico_nombre: string;
  vehiculo: number | null;
  vehiculo_detalle: Vehiculo | null;
  operador_responsable: number | null;
  operador_nombre?: string;
  fecha_planificada: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: 'planificada' | 'asignada' | 'en_progreso' | 'en_transito' | 'entregando' | 'completada' | 'cancelada';
  estado_display?: string;
  departamento: number;
  departamento_nombre: string;
  punto_origen: number | null;
  punto_origen_nombre?: string;
  peso_total_kg: string;
  volumen_total_m3: string;
  km_estimados: string | null;
  etiquetas: string[];
  observaciones: string;
  pedidos: PedidoRuta[];
  total_pedidos: number;
  pedidos_entregados: number;
}

export interface CreateRutaRequest {
  nombre_ruta: string;
  tecnico_campo: number;
  vehiculo?: number;
  operador_responsable?: number;
  fecha_planificada: string;
  departamento: number;
  punto_origen?: number;
  km_estimados?: number;
  etiquetas?: string[];
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

export interface Pedido {
  id: number;
  codigo_seguimiento: string;
  estado: string;
  nombres_cliente: string;
  apellidos_cliente: string;
  municipio_entrega_nombre?: string;
  total: string;
  fecha_pedido: string;
}

export const logisticaService = {
  // RUTAS 
  getRutas: async (filtros?: { estado?: string; departamento?: number }): Promise<RutaEntrega[]> => {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.departamento) params.append('departamento', filtros.departamento.toString());
    
    const response = await axiosInstance.get<RutaEntrega[]>(`/rutas/?${params.toString()}`);
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

  updateRuta: async (id: number, data: Partial<CreateRutaRequest>): Promise<RutaEntrega> => {
    const response = await axiosInstance.patch<RutaEntrega>(`/rutas/${id}/`, data);
    return response.data;
  },

  deleteRuta: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/rutas/${id}/`);
  },

  iniciarRuta: async (id: number): Promise<any> => {
    const response = await axiosInstance.post(`/rutas/${id}/iniciar_ruta/`);
    return response.data;
  },

  finalizarRuta: async (id: number): Promise<any> => {
    const response = await axiosInstance.post(`/rutas/${id}/finalizar_ruta/`);
    return response.data;
  },

  //  VEHÍCULOS 
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

  updateVehiculo: async (id: number, data: Partial<Vehiculo>): Promise<Vehiculo> => {
    const response = await axiosInstance.patch<Vehiculo>(`/vehiculos/${id}/`, data);
    return response.data;
  },

  deleteVehiculo: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/vehiculos/${id}/`);
  },

  // TRANSPORTISTAS 
  getTransportistas: async (): Promise<Transportista[]> => {
    const response = await axiosInstance.get<Transportista[]>('/transportistas/');
    return response.data;
  },

  // PUNTOS DE SIEMBRA 
  getPuntosSiembra: async (): Promise<PuntoSiembra[]> => {
    const response = await axiosInstance.get<PuntoSiembra[]>('/puntos-siembra/');
    return response.data;
  },

  //  FINCAS 
  getFincas: async (): Promise<Finca[]> => {
    const response = await axiosInstance.get<Finca[]>('/fincas/');
    return response.data;
  },

  //  ESTADÍSTICAS 
  getEstadisticas: async (): Promise<EstadisticasLogistica> => {
    const response = await axiosInstance.get<EstadisticasLogistica>('/rutas/estadisticas/');
    return response.data;
  },

  // PEDIDOS 
  getPedidosDisponibles: async (): Promise<Pedido[]> => {
    const response = await axiosInstance.get<Pedido[]>('/pedidos/?estado=listo_entrega');
    return response.data;
  },
};