import type { Ingreso, PaginatedResponse } from '../types/models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface GetIngresosParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    search?: string;
    estado?: string;
}

export const ingresosService = {
    async getAll(params: GetIngresosParams = {}): Promise<PaginatedResponse<Ingreso>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);
    if (params.search) query.set('search', params.search);
    if (params.estado) query.set('estado', params.estado);

    const res = await fetch(`${API_URL}/ingresos?${query.toString()}`);
    if (!res.ok) throw new Error('Error al obtener ingresos');
    return res.json();
    },

    async getById(id: number): Promise<Ingreso> {
    const res = await fetch(`${API_URL}/ingresos/${id}`);
    if (!res.ok) throw new Error('Ingreso no encontrado');
    const json = await res.json();
    return json.data;
    },

    async create(data: Omit<Ingreso, 'id_ingreso'>): Promise<Ingreso> {
    const payload = {
        ...data,
        monto: Number(data.monto),
    };

    const res = await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Error al crear ingreso');
    return json.data;
    },

    async update(id: number, data: Partial<Ingreso>): Promise<Ingreso> {
    const payload = { ...data };
    if (payload.monto !== undefined) payload.monto = Number(payload.monto);

    const res = await fetch(`${API_URL}/ingresos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || 'Error al actualizar ingreso');
    return json.data;
    },

    async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/ingresos/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar ingreso');
    },
};