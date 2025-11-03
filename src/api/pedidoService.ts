// src/api/pedidoService.ts
import axiosInstance from './axiosConfig';
import type { Pedido, CreatePedidoRequest, PaginatedResponse } from '../types';

export const pedidoService = {
  // Listar todos los pedidos
  getAllPedidos: async (params?: {
    page?: number;
    estado?: string;
  }): Promise<PaginatedResponse<Pedido>> => {
    const response = await axiosInstance.get<PaginatedResponse<Pedido>>('/pedidos/', {
      params,
    });
    return response.data;
  },

  // Obtener mis pedidos
  getMisPedidos: async (): Promise<Pedido[]> => {
    const response = await axiosInstance.get<Pedido[]>('/pedidos/mis-pedidos/');
    return response.data;
  },

  // Obtener detalle de un pedido
  getPedidoById: async (id: number): Promise<Pedido> => {
    const response = await axiosInstance.get<Pedido>(`/pedidos/${id}/`);
    return response.data;
  },

  // Crear nuevo pedido
  createPedido: async (data: CreatePedidoRequest): Promise<Pedido> => {
    // Si hay comprobante de pago, usar FormData
    if (data.comprobante_pago) {
      const formData = new FormData();
      
      // Agregar campos básicos
      formData.append('nombre_contacto', data.nombre_contacto);
      formData.append('telefono_contacto', data.telefono_contacto);
      
      if (data.nombres_cliente) formData.append('nombres_cliente', data.nombres_cliente);
      if (data.apellidos_cliente) formData.append('apellidos_cliente', data.apellidos_cliente);
      
      // Datos de facturación
      if (data.nit_facturacion) formData.append('nit_facturacion', data.nit_facturacion);
      if (data.nombre_facturacion) formData.append('nombre_facturacion', data.nombre_facturacion);
      if (data.direccion_facturacion) formData.append('direccion_facturacion', data.direccion_facturacion);
      
      // Dirección de entrega
      formData.append('direccion_entrega', data.direccion_entrega);
      formData.append('municipio_entrega', data.municipio_entrega.toString());
      if (data.referencia_entrega) formData.append('referencia_entrega', data.referencia_entrega);
      if (data.centro_poblado) formData.append('centro_poblado', data.centro_poblado);
      
      // Información de pago
      formData.append('tipo_pago', data.tipo_pago);
      if (data.comentario_pago) formData.append('comentario_pago', data.comentario_pago);
      if (data.numero_deposito) formData.append('numero_deposito', data.numero_deposito);
      if (data.fecha_deposito) formData.append('fecha_deposito', data.fecha_deposito);
      if (data.monto_deposito) formData.append('monto_deposito', data.monto_deposito);
      
      // Comprobante de pago (archivo)
      formData.append('comprobante_pago', data.comprobante_pago);
      
      // Observaciones
      if (data.observaciones) formData.append('observaciones', data.observaciones);
      
      // Canal de origen
      formData.append('canal_origen', data.canal_origen || 'web');
      
      // Detalles - Enviar cada detalle individualmente
      data.detalles.forEach((detalle, index) => {
        formData.append(`detalles[${index}]pilon`, detalle.pilon.toString());
        formData.append(`detalles[${index}]cantidad`, detalle.cantidad.toString());
        formData.append(`detalles[${index}]precio_unitario`, detalle.precio_unitario);
      });
      
      const response = await axiosInstance.post<Pedido>('/pedidos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sin archivo, enviar como JSON normal
      const payload = {
        nombre_contacto: data.nombre_contacto,
        telefono_contacto: data.telefono_contacto,
        nombres_cliente: data.nombres_cliente,
        apellidos_cliente: data.apellidos_cliente,
        nit_facturacion: data.nit_facturacion,
        nombre_facturacion: data.nombre_facturacion,
        direccion_facturacion: data.direccion_facturacion,
        direccion_entrega: data.direccion_entrega,
        centro_poblado: data.centro_poblado,
        municipio_entrega: data.municipio_entrega,
        referencia_entrega: data.referencia_entrega,
        tipo_pago: data.tipo_pago,
        comentario_pago: data.comentario_pago,
        numero_deposito: data.numero_deposito,
        fecha_deposito: data.fecha_deposito,
        monto_deposito: data.monto_deposito,
        observaciones: data.observaciones,
        canal_origen: data.canal_origen || 'web',
        detalles: data.detalles.map(d => ({
          pilon: d.pilon,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      };
      
      const response = await axiosInstance.post<Pedido>('/pedidos/', payload);
      return response.data;
    }
  },

  // Cambiar estado del pedido
  cambiarEstado: async (
    id: number,
    nuevoEstado: string,
    observaciones?: string
  ): Promise<Pedido> => {
    const response = await axiosInstance.post<Pedido>(`/pedidos/${id}/cambiar-estado/`, {
      nuevo_estado: nuevoEstado,
      observaciones,
    });
    return response.data;
  },

  // Calificar pedido
  calificarPedido: async (
    id: number,
    calificacion: number,
    comentario?: string
  ): Promise<Pedido> => {
    const response = await axiosInstance.post<Pedido>(`/pedidos/${id}/calificar/`, {
      calificacion,
      comentario,
    });
    return response.data;
  },

  // Cancelar pedido
  cancelarPedido: async (id: number, motivo?: string): Promise<void> => {
    await axiosInstance.post(`/pedidos/${id}/cancelar/`, { motivo });
  },
};