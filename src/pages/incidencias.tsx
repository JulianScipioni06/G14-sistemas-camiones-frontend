import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { AlertTriangle, Search, X } from 'lucide-react';
import { getIncidencias } from '../services/incidencia.service';
import { getViajes } from '../services/viaje.service';
import type { ApiResponse, Incidencia, Viaje } from '../types/models';
import '../styles/ui.css';
import '../styles/incidencias.css';

export const Incidencias = () => {
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [viajes, setViajes] = useState<Viaje[]>([]);

    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');
            const [resIncidencias, resViajes] = await Promise.all([
                getIncidencias(),
                getViajes(),
            ]);

            setIncidencias(resIncidencias.data || []);
            setViajes(resViajes.data || []);
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('Error al cargar el listado de incidencias.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarDatos();
    }, []);

    const getViajeLabel = (idViaje: number) => {
        const encontrado = viajes.find((v) => v.id_viaje === idViaje);
        if (encontrado) {
            return `${encontrado.remito} · ${encontrado.destino}`;
        }
        return `Viaje #${idViaje}`;
    };

    const formatFechaHora = (fechaHora: string) => {
        if (!fechaHora) {
            return '-';
        }
        const parsed = new Date(fechaHora);
        if (Number.isNaN(parsed.getTime())) {
            return fechaHora;
        }
        return parsed.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    const term = search.trim().toLowerCase();
    const incidenciasFiltradas = incidencias.filter((item) => {
        if (!term) {
            return true;
        }
        const viajeTexto = getViajeLabel(item.id_viaje).toLowerCase();
        const fechaTexto = formatFechaHora(item.fecha_hora).toLowerCase();

        return (
            String(item.id_incidencia).includes(term) ||
            item.descripcion.toLowerCase().includes(term) ||
            viajeTexto.includes(term) ||
            fechaTexto.includes(term)
        );
    });

    const totalItems = incidenciasFiltradas.length;
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
    const incidenciasPaginadas = incidenciasFiltradas.slice(startIndex, endIndex);

    let fromRecord = 0;
    let toRecord = 0;
    if (totalItems > 0) {
        fromRecord = startIndex + 1;
        toRecord = Math.min(endIndex, totalItems);
    }

    return (
        <div className="page-container">
        <div className="page-header">
            <div className="page-title-group">
            <span className="page-breadcrumb">OPERACIONES / INCIDENCIAS</span>
            <h2>Incidencias</h2>
            <p>Consultá y registrá novedades o inconvenientes ocurridos durante los viajes.</p>
            </div>

            <Link to="/incidencias/nuevo" className="btn-outline">
            Nueva incidencia
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
            <AlertTriangle size={18} />
            <span>
            <strong>{totalItems}</strong> incidencias encontradas
            </span>
        </div>

        <div className="card">
            <div className="card-toolbar">
            <div className="control-group">
                <label htmlFor="search-incidencias">Buscar incidencias</label>
                <div className="search-box incidencias-search-box">
                <Search size={16} className="search-icon" />
                <input
                    id="search-incidencias"
                    type="text"
                    className="search-input"
                    placeholder="Buscar por descripción, remito, destino o ID..."
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
                <label htmlFor="page-size-incidencias">Registros por página</label>
                <select
                id="page-size-incidencias"
                className="select-field"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                <option value={5}>5 incidencias</option>
                <option value={10}>10 incidencias</option>
                <option value={25}>25 incidencias</option>
                </select>
            </div>
            </div>

            <div className="table-scroll">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="incidencias-id-col">ID</th>
                    <th>Descripción</th>
                    <th className="incidencias-viaje-col">Viaje asociado</th>
                    <th className="incidencias-fecha-col">Fecha y hora</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                    <td colSpan={4} className="table-empty">
                        Cargando registros...
                    </td>
                    </tr>
                )}

                {!loading && incidenciasPaginadas.length === 0 && (
                    <tr>
                    <td colSpan={4} className="table-empty">
                        No se encontraron incidencias.
                    </td>
                    </tr>
                )}

                {!loading &&
                    incidenciasPaginadas.map((item) => (
                    <tr key={item.id_incidencia}>
                        <td className="incidencias-id-col">{item.id_incidencia}</td>
                        <td>
                        <Link
                            to={`/incidencias/${item.id_incidencia}`}
                            className="record-link"
                        >
                            {item.descripcion}
                        </Link>
                        </td>
                        <td className="incidencias-viaje-col">
                        {getViajeLabel(item.id_viaje)}
                        </td>
                        <td className="incidencias-fecha-col">
                        {formatFechaHora(item.fecha_hora)}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <div className="pagination-bar">
            <span>
                {fromRecord}–{toRecord} de {totalItems} incidencias
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