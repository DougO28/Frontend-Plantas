//dashboardService
import axiosInstance from './axiosConfig';

export interface VentasStats {
  total_ventas_hoy: number;
  total_ventas_semana: number;
  total_ventas_mes: number;
  pedidos_hoy: number;
  pedidos_semana: number;
  pedidos_mes: number;
  pedidos_por_estado: { [key: string]: number };
}

export interface ProductoVendido {
  pilon_id: number;
  nombre_variedad: string;
  categoria: string;
  cantidad_vendida: number;
  total_vendido: number;
}

export interface StockBajo {
  id: number;
  nombre_variedad: string;
  categoria: string;
  stock: number;
  stock_minimo: number;
  porcentaje_stock: number;
}

export interface VentaDiaria {
  fecha: string;
  total: number;
  cantidad_pedidos: number;
}

export interface DashboardEstadisticas {
  ventas: VentasStats;
  top_productos: ProductoVendido[];
  stock_bajo: StockBajo[];
  ventas_diarias: VentaDiaria[];
}

export const dashboardService = {
  // Obtener estadísticas completas
  getEstadisticas: async (): Promise<DashboardEstadisticas> => {
    const response = await axiosInstance.get<DashboardEstadisticas>('/dashboard/estadisticas/');
    return response.data;
  },
};