import api from '../api/axios';
import type { ApiResponse, Chofer } from '../types/models';

export interface CreateChoferPayload {
  dni: string;
  nombre_completo: string;
  telefono: string;
  domicilio: string;
  email: string;
  vencimiento_carnet: string;
  id_usuario: number;
}

export type UpdateChoferPayload = Partial<CreateChoferPayload>;

export const getChoferes = async (page = 1, limit = 100) => {
  const { data } = await api.get<ApiResponse<Chofer[]>>('/choferes', {
    params: { page, limit },
  });
  return data;
};

export const getChoferById = async (id: number) => {
  const { data } = await api.get<ApiResponse<Chofer>>(`/choferes/${id}`);
  return data;
};

export const createChofer = async (payload: CreateChoferPayload) => {
  const { data } = await api.post<ApiResponse<Chofer>>('/choferes', payload);
  return data;
};

export const updateChofer = async (id: number, payload: UpdateChoferPayload) => {
  const { data } = await api.put<ApiResponse<Chofer>>(`/choferes/${id}`, payload);
  return data;
};

export const deleteChofer = async (id: number) => {
  const { data } = await api.delete<ApiResponse<null>>(`/choferes/${id}`);
  return data;
};