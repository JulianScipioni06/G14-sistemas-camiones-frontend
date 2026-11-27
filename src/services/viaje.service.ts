import api from '../api/axios';
import type {
    ApiResponse,
    Viaje,
    Camion,
    AcopladoOption,
    ChoferOption,
    ClienteOption,
} from '../types/models';

export interface ViajePayload {
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

export const getViajes = async () => {
    const { data } = await api.get<ApiResponse<Viaje[]>>('/viajes');
    return data;
};

export const getViajeById = async (id: number) => {
    const { data } = await api.get<ApiResponse<Viaje>>(`/viajes/${id}`);
    return data;
};

export const createViaje = async (payload: ViajePayload) => {
    const { data } = await api.post<ApiResponse<Viaje>>('/viajes', payload);
    return data;
};

export const updateViaje = async (id: number, payload: Partial<ViajePayload>) => {
    const { data } = await api.put<ApiResponse<Viaje>>(`/viajes/${id}`, payload);
    return data;
};

export const deleteViaje = async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/viajes/${id}`);
    return data;
};

export const getCamionesOptions = async () => {
    const { data } = await api.get<ApiResponse<Camion[]>>('/camiones' ,{
        params: {limit: 100},
    });
    return data;
};

export const getAcopladosOptions = async () => {
    const { data } = await api.get<ApiResponse<AcopladoOption[]>>('/acoplados');
    return data;
};

export const getChoferesOptions = async () => {
    const { data } = await api.get<ApiResponse<ChoferOption[]>>('/choferes');
    return data;
};

export const getClientesOptions = async () => {
    const { data } = await api.get<ApiResponse<ClienteOption[]>>('/clientes');
    return data;
};