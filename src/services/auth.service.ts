import api from '../api/axios';
import type { ApiResponse, Usuario } from '../types/models';

export interface LoginPayload {
    usuario: string;
    contrasena: string;
}

export interface LoginData {
    token: string;
    usuario: Usuario;
}

export const loginRequest = async (credentials: LoginPayload) => {
    const { data } = await api.post<ApiResponse<LoginData>>('/auth/login', credentials);

    if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
    }

    if (data.data?.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
    }

    return data;
};

export const logoutRequest = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

export const isAuthenticated = (): boolean => {
    return Boolean(localStorage.getItem('token'));
};

export const getStoredUser = (): Usuario | null => {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as Usuario;
    } catch {
        return null;
    }
};