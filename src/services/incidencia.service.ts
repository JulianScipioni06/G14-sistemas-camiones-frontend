import api from '../api/axios';
import type { ApiResponse, Incidencia } from '../types/models';

export interface IncidenciaPayload {
    descripcion: string;
    fecha_hora: string;
    id_viaje: number;
}

export const getIncidencias = async () => {
    const { data } = await api.get<ApiResponse<Incidencia[]>>('/incidencias');
    return data;
};

export const getIncidenciaById = async (id: number) => {
    const { data } = await api.get<ApiResponse<Incidencia>>(`/incidencias/${id}`);
    return data;
};

export const createIncidencia = async (payload: IncidenciaPayload) => {
    const { data } = await api.post<ApiResponse<Incidencia>>('/incidencias', payload);
    return data;
};

export const updateIncidencia = async (id: number, payload: Partial<IncidenciaPayload>) => {
    const { data } = await api.put<ApiResponse<Incidencia>>(`/incidencias/${id}`, payload);
    return data;
};

export const deleteIncidencia = async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/incidencias/${id}`);
    return data;
};