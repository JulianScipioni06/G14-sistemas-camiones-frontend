export interface ApiResponse<T> {
    msg: string;
    code: number;
    data: T;
    total?: number;
    page?: number;
    limit?: number;
}

export interface Usuario {
    id_usuario: number;
    usuario: string;
    contrasena?: string;
    rol: string;
}

export interface Viaje {
    id_viaje: number;
    fecha_carga: string;
    remito: string;
    kgs: number;
    kms_recorridos: number;
    destino: string;
    estado: string;
    id_camion: number;
    id_acoplado: number | null;
    id_chofer: number;
    id_cliente: number;
}

export interface Incidencia {
    id_incidencia: number;
    descripcion: string;
    fecha_hora: string;
    id_viaje: number;
}

export interface CamionOption {
    id_camion: number;
    patente: string;
    marca: string;
    modelo: string;
}

export interface AcopladoOption {
    id_acoplado: number;
    patente: string;
    tipo: string;
}

export interface ChoferOption {
    id_chofer: number;
    nombre_completo: string;
    dni: string;
}

export interface ClienteOption {
    id_cliente: number;
    razon_social: string;
    cuit: string;
}

export interface Ingreso {
    id_ingreso: number;
    id_viaje: number | null;
    id_cliente: number | null;
    concepto: string;
    monto: number | string;
    fecha: string;
    metodo_pago: string | null;
    estado: string;
}

export interface PaginatedResponse<T> {
    msg: string;
    code: number;
    total: number;
    page: number;
    limit: number;
    data: T[];
}