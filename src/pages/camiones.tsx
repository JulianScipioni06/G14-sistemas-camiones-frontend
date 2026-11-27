import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Truck, Search, X, AlertTriangle } from 'lucide-react';
import { getCamiones } from '../services/camion.service';
import type { ApiResponse, Camion } from '../types/models';
import { estadoVencimiento } from '../utils/vencimientos';
import { VencimientoBadge } from '../components/VencimientoBadge';
import '../styles/ui.css';
import '../styles/camiones.css';

export const Camiones = () => {
    const [camiones, setCamiones] = useState<Camion[]>([]);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Espera 400 ms desde la última tecla antes de buscar
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError('');

                const res = await getCamiones({
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    sortBy: 'id_camion',
                    order: 'ASC',
                });

                setCamiones(res.data || []);
                setTotal(res.total ?? 0);
            } catch (err) {
                const axiosError = err as AxiosError<ApiResponse<null>>;
                if (axiosError.response?.data?.msg) {
                    setError(axiosError.response.data.msg);
                } else {
                    setError('Error al cargar el listado de camiones.');
                }
            } finally {
                setLoading(false);
            }
        };

        void cargarDatos();
    }, [currentPage, pageSize, debouncedSearch]);

    const getEstadoBadgeClass = (estado: string) => {
        const normalizado = estado.toLowerCase();
        if (normalizado === 'disponible') {
            return 'badge badge-success';
        }
        if (normalizado === 'en viaje') {
            return 'badge badge-accent';
        }
        if (normalizado === 'en reparación') {
            return 'badge badge-warning';
        }
        return 'badge';
    };

    const tieneAlerta = (c: Camion) =>
        estadoVencimiento(c.vencimiento_vtv) !== 'vigente' ||
        estadoVencimiento(c.vencimiento_seguro) !== 'vigente';

    const conAlertas = camiones.filter(tieneAlerta).length;

    let totalPages = Math.ceil(total / pageSize);
    if (totalPages < 1) {
        totalPages = 1;
    }

    let fromRecord = 0;
    let toRecord = 0;
    if (total > 0) {
        fromRecord = (currentPage - 1) * pageSize + 1;
        toRecord = Math.min(currentPage * pageSize, total);
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title-group">
                    <span className="page-breadcrumb">FLOTA / CAMIONES</span>
                    <h2>Camiones</h2>
                    <p>Consultá el estado de la flota y los vencimientos de VTV y seguro.</p>
                </div>

                <Link to="/camiones/nuevo" className="btn-outline">
                    Nuevo camión
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
                <Truck size={18} />
                <span>
                    <strong>{total}</strong> camiones encontrados
                </span>
            </div>

            {conAlertas > 0 && (
                <div className="alert alert-error" role="status">
                    <span>
                        <AlertTriangle size={15} style={{ verticalAlign: 'text-bottom' }} />{' '}
                        {conAlertas} camión(es) de esta página con VTV o seguro vencido o por vencer.
                    </span>
                </div>
            )}

            <div className="card">
                <div className="card-toolbar">
                    <div className="control-group">
                        <label htmlFor="search-camiones">Buscar camiones</label>
                        <div className="search-box camiones-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                id="search-camiones"
                                type="text"
                                className="search-input"
                                placeholder="Buscar por patente, marca o modelo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="search-clear"
                                    aria-label="Limpiar búsqueda"
                                    onClick={() => setSearch('')}
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="control-group">
                        <label htmlFor="page-size-camiones">Registros por página</label>
                        <select
                            id="page-size-camiones"
                            className="select-field"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={5}>5 camiones</option>
                            <option value={10}>10 camiones</option>
                            <option value={25}>25 camiones</option>
                        </select>
                    </div>
                </div>

                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="camiones-id-col">ID</th>
                                <th>Patente</th>
                                <th>Marca / Modelo</th>
                                <th className="camiones-num-col">Kms</th>
                                <th>VTV</th>
                                <th>Seguro</th>
                                <th className="camiones-estado-col">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="table-empty">
                                        Cargando registros...
                                    </td>
                                </tr>
                            )}

                            {!loading && camiones.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="table-empty">
                                        No se encontraron camiones.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                camiones.map((c) => (
                                    <tr key={c.id_camion}>
                                        <td className="camiones-id-col">{c.id_camion}</td>
                                        <td>
                                            <Link to={`/camiones/${c.id_camion}`} className="record-link">
                                                {c.patente}
                                            </Link>
                                        </td>
                                        <td>
                                            {c.marca} {c.modelo}
                                        </td>
                                        <td className="camiones-num-col">
                                            {c.kms_recorridos.toLocaleString('es-AR')} km
                                        </td>
                                        <td className="camiones-num-col">
                                            <VencimientoBadge fecha={c.vencimiento_vtv} />
                                        </td>
                                        <td className="camiones-num-col">
                                            <VencimientoBadge fecha={c.vencimiento_seguro} />
                                        </td>
                                        <td className="camiones-estado-col">
                                            <span className={getEstadoBadgeClass(c.estado)}>{c.estado}</span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-bar">
                    <span>
                        {fromRecord}–{toRecord} de {total} camiones
                    </span>

                    <div className="pagination-controls">
                        <button
                            type="button"
                            className="page-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Anterior
                        </button>
                        <span className="page-number">{currentPage}</span>
                        <button
                            type="button"
                            className="page-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};