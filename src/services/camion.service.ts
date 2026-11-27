import api from '../api/axios';
import type { ApiResponse, Camion } from '../types/models';

export interface CamionPayload {
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

export interface CamionesQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

export const getCamiones = async (params: CamionesQuery = {}) => {
    const { data } = await api.get<ApiResponse<Camion[]>>('/camiones', { params });
    return data;
};

export const getCamionById = async (id: number) => {
    const { data } = await api.get<ApiResponse<Camion>>(`/camiones/${id}`);
    return data;
};

export const createCamion = async (payload: CamionPayload) => {
    const { data } = await api.post<ApiResponse<Camion>>('/camiones', payload);
    return data;
};

export const updateCamion = async (id: number, payload: CamionPayload) => {
    const { data } = await api.put<ApiResponse<Camion>>(`/camiones/${id}`, payload);
    return data;
};

export const deleteCamion = async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/camiones/${id}`);
    return data;
};