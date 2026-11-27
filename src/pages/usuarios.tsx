import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Users, Search, X } from 'lucide-react';
import { getUsuarios } from '../services/usuario.service';
import type { ApiResponse, Usuario } from '../types/models';
import '../styles/ui.css';
import '../styles/usuarios.css';

export const Usuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarUsuarios = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getUsuarios();
            setUsuarios(res.data || []);
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
            setError(axiosError.response.data.msg);
            } else {
            setError('Error al cargar el listado de usuarios.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarUsuarios();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    const term = search.trim().toLowerCase();
    const usuariosFiltrados = usuarios.filter((item) => {
        if (!term) {
        return true;
        }
        return (
        String(item.id_usuario).includes(term) ||
        item.usuario.toLowerCase().includes(term) ||
        item.rol.toLowerCase().includes(term)
        );
    });

    const totalItems = usuariosFiltrados.length;
    let totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages < 1) {
        totalPages = 1;
    }

    let safePage = currentPage;
    if (safePage > totalPages) {
        safePage = totalPages;
    }

    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const usuariosPaginados = usuariosFiltrados.slice(startIndex, endIndex);

    let fromRecord = 0;
    let toRecord = 0;
    if (totalItems > 0) {
        fromRecord = startIndex + 1;
        toRecord = Math.min(endIndex, totalItems);
    }

    const getRolBadgeClass = (rol: string) => {
        if (rol === 'admin') {
        return 'badge badge-accent';
        }
        if (rol === 'chofer') {
        return 'badge badge-success';
        }
        return 'badge';
    };

    return (
        <div className="page-container">
        <div className="page-header">
            <div className="page-title-group">
            <span className="page-breadcrumb">SISTEMA / USUARIOS</span>
            <h2>Usuarios</h2>
            <p>Consultá las cuentas de acceso y roles registrados en el sistema.</p>
            </div>

            <Link to="/usuarios/nuevo" className="btn-outline">
            Nuevo usuario
            </Link>
        </div>

        {error && (
            <div className="alert alert-error" role="alert">
            <span>{error}</span>
            <button type="button" className="alert-close" onClick={() => setError('')}>
                <X size={16} />
            </button>
            </div>
        )}

        <div className="count-banner">
            <Users size={18} />
            <span>
            <strong>{totalItems}</strong> usuarios encontrados
            </span>
        </div>

        <div className="card">
            <div className="card-toolbar">
            <div className="control-group">
                <label htmlFor="search-usuarios">Buscar usuarios</label>
                <div className="search-box usuarios-search-box">
                <Search size={16} className="search-icon" />
                <input
                    id="search-usuarios"
                    type="text"
                    className="search-input"
                    placeholder="Buscar por usuario, rol o ID..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
                {search && (
                    <button
                    type="button"
                    className="search-clear"
                    aria-label="Limpiar búsqueda"
                    onClick={() => handleSearchChange('')}
                    >
                    <X size={15} />
                    </button>
                )}
                </div>
            </div>

            <div className="control-group">
                <label htmlFor="page-size-usuarios">Registros por página</label>
                <select
                id="page-size-usuarios"
                className="select-field"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                <option value={5}>5 usuarios</option>
                <option value={10}>10 usuarios</option>
                <option value={25}>25 usuarios</option>
                </select>
            </div>
            </div>

            <div className="table-scroll">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="usuarios-id-col">ID</th>
                    <th>Usuario</th>
                    <th className="usuarios-rol-col">Rol</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                    <td colSpan={3} className="table-empty">
                        Cargando registros...
                    </td>
                    </tr>
                )}

                {!loading && usuariosPaginados.length === 0 && (
                    <tr>
                    <td colSpan={3} className="table-empty">
                        No se encontraron usuarios.
                    </td>
                    </tr>
                )}

                {!loading &&
                    usuariosPaginados.map((item) => (
                    <tr key={item.id_usuario}>
                        <td className="usuarios-id-col">{item.id_usuario}</td>
                        <td>
                        <Link to={`/usuarios/${item.id_usuario}`} className="record-link">
                            {item.usuario}
                        </Link>
                        </td>
                        <td className="usuarios-rol-col">
                        <span className={getRolBadgeClass(item.rol)}>{item.rol}</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <div className="pagination-bar">
            <span>
                {fromRecord}–{toRecord} de {totalItems} usuarios
            </span>

            <div className="pagination-controls">
                <button
                type="button"
                className="page-btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                >
                Anterior
                </button>
                <span className="page-number">{safePage}</span>
                <button
                type="button"
                className="page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                >
                Siguiente
                </button>
            </div>
            </div>
        </div>
        </div>
    );
};