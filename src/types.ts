// src/types.ts

// ============= USUARIO =============
export interface Usuario {
  id: number;
  email: string;
  nombre_completo: string;
  telefono?: string;
  direccion?: string;
  roles: string[];
  departamento?: number;
  municipio?: number;
  fecha_registro: string;
  ultimo_acceso?: string;
  activo: boolean;
}

// ============= AUTENTICACIÓN =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Usuario;
}

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// ============= UBICACIÓN =============
export interface Departamento {
  id: number;
  nombre: string;
  region: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  departamento: number;
  departamento_detalle?: Departamento;
}

// ============= CATÁLOGO =============
export interface CategoriaPlanta {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CatalogoPilon {
  id: number;
  codigo_pilon: string;
  nombre_comun: string;
  nombre_cientifico?: string;
  categoria: CategoriaPlanta;
  descripcion?: string;
  precio_unitario: string;
  cantidad_disponible: number;
  unidad_medida: string;
  tiempo_crecimiento_dias?: number;
  foto?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ============= PEDIDO (ACTUALIZADO) =============
export interface DetallePedido {
  id?: number;
  pilon: number;
  pilon_detalle?: CatalogoPilon;
  cantidad: number;
  precio_unitario?: string;
  subtotal?: string;
}

export interface Pedido {
  id: number;
  codigo_seguimiento: string;
  usuario: number;
  usuario_detalle?: Usuario;
  
  // Estado y fechas
  estado: 'recibido' | 'confirmado' | 'en_preparacion' | 'listo_entrega' | 'en_ruta' | 'entregado' | 'cancelado';
  fecha_pedido: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  
  // Información de contacto
  nombre_contacto: string;
  telefono_contacto: string;
  nombres_cliente?: string;
  apellidos_cliente?: string;
  
  // Datos de facturación
  nit_facturacion?: string;
  nombre_facturacion?: string;
  direccion_facturacion?: string;
  
  // Dirección de entrega
  direccion_entrega: string;
  municipio_entrega: number;
  municipio_entrega_detalle?: Municipio;
  referencia_entrega?: string;
  centro_poblado?: string;
  direccion_compuesta?: string;
  
  // Información de pago
  tipo_pago: 'transferencia' | 'contra_entrega' | 'efectivo' | 'tarjeta';
  comentario_pago?: string;
  numero_deposito?: string;
  fecha_deposito?: string;
  monto_deposito?: string;
  comprobante_pago?: string;
  
  // Información de viaje/logística
  pendiente_viaje: boolean;
  fecha_viaje?: string;
  link_pendientes?: string;
  
  // Gestión interna
  vendedor?: number;
  vendedor_detalle?: Usuario;
  tecnico_encargado?: number;
  tecnico_encargado_detalle?: Usuario;
  orden_cerrada: boolean;
  comentarios_internos?: string;
  
  // Detalles del pedido
  detalles: DetallePedido[];
  
  // Valores
  total: string;
  descuento: string;
  
  // Observaciones
  observaciones?: string;
  observaciones_internas?: string;
  
  // Canal y calificación
  canal_origen: 'telefono' | 'whatsapp' | 'presencial' | 'app_movil' | 'web';
  calificacion?: number;
  comentario_calificacion?: string;
  
  activo: boolean;
}

// ============= CREAR PEDIDO REQUEST =============
export interface CreatePedidoRequest {
  // Información de contacto (requerido)
  nombre_contacto: string;
  telefono_contacto: string;
  nombres_cliente?: string;
  apellidos_cliente?: string;
  
  // Datos de facturación (opcional)
  nit_facturacion?: string;
  nombre_facturacion?: string;
  direccion_facturacion?: string;
  
  // Dirección de entrega (requerido)
  direccion_entrega: string;
  municipio_entrega: number;
  referencia_entrega?: string;
  centro_poblado?: string;
  
  // Información de pago
  tipo_pago: 'transferencia' | 'contra_entrega' | 'efectivo' | 'tarjeta';
  comentario_pago?: string;
  numero_deposito?: string;
  fecha_deposito?: string;
  monto_deposito?: string;
  comprobante_pago?: File | null;
  
  // Detalles del pedido (requerido)
  detalles: {
    pilon: number;
    cantidad: number;
    precio_unitario: string;
  }[];
  
  // Observaciones
  observaciones?: string;
  
  // Canal de origen
  canal_origen?: 'telefono' | 'whatsapp' | 'presencial' | 'app_movil' | 'web';
}

// ============= API RESPONSE =============
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Agregar esta interfaz a tu archivo de types
export interface RegisterData {
  nombre_completo: string;
  email: string;
  telefono: string;
  password: string;
  confirm_password: string;
  direccion?: string;
  municipio?: number;
}

// Y actualizar AuthContextType para incluir register
export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<any>; // AGREGAR ESTA LÍNEA
  logout: () => void;
  refreshToken: () => Promise<void>;
}