import api from '../api/axios';
import type { ApiResponse, Cliente } from '../types/models';

export interface CreateClientePayload {
  razon_social: string;
  cuit: string;
  direccion?: string | null;
  telefono: string;
  email?: string | null;
}

export type UpdateClientePayload = Partial<CreateClientePayload>;

export const getClientes = async (page = 1, limit = 100) => {
  const { data } = await api.get<ApiResponse<Cliente[]>>('/clientes', {
    params: { page, limit },
  });
  return data;
};

export const getClienteById = async (id: number) => {
  const { data } = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`);
  return data;
};

export const createCliente = async (payload: CreateClientePayload) => {
  const { data } = await api.post<ApiResponse<Cliente>>('/clientes', payload);
  return data;
};

export const updateCliente = async (id: number, payload: UpdateClientePayload) => {
  const { data } = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, payload);
  return data;
};

export const deleteCliente = async (id: number) => {
  const { data } = await api.delete<ApiResponse<null>>(`/clientes/${id}`);
  return data;
};