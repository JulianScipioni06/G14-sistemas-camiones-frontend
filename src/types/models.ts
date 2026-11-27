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
export interface Camion {
    id_camion: number;
    patente: string;
    marca: string;
    modelo: string;
    capacidad: number;
    tara: number;
    estado: string;
    kms_recorridos: number;
    vencimiento_vtv: string;
    vencimiento_seguro: string;
}