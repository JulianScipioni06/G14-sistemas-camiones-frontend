import api from '../api/axios';
import type { ApiResponse, Usuario } from '../types/models';

export interface CreateUsuarioPayload {
    usuario: string;
    contrasena: string;
    rol: string;
}

export interface UpdateUsuarioPayload {
    usuario?: string;
    contrasena?: string;
    rol?: string;
}

export const getUsuarios = async () => {
    const { data } = await api.get<ApiResponse<Usuario[]>>('/usuarios');
    return data;
};

export const getUsuarioById = async (id: number) => {
    const { data } = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
    return data;
};

export const createUsuario = async (payload: CreateUsuarioPayload) => {
    const { data } = await api.post<ApiResponse<Usuario>>('/usuarios', payload);
    return data;
};

export const updateUsuario = async (id: number, payload: UpdateUsuarioPayload) => {
    const { data } = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, payload);
    return data;
};

export const deleteUsuario = async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/usuarios/${id}`);
    return data;
};