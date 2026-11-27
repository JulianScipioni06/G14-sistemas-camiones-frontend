import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Truck, Search, X } from 'lucide-react';
import {
    getViajes,
    getCamionesOptions,
    getChoferesOptions,
    getClientesOptions,
} from '../services/viaje.service';
import type {
    ApiResponse,
    Viaje,
    CamionOption,
    ChoferOption,
    ClienteOption,
} from '../types/models';
import '../styles/ui.css';
import '../styles/viajes.css';

export const Viajes = () => {
    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [camiones, setCamiones] = useState<CamionOption[]>([]);
    const [choferes, setChoferes] = useState<ChoferOption[]>([]);
    const [clientes, setClientes] = useState<ClienteOption[]>([]);

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
            const [resViajes, resCamiones, resChoferes, resClientes] = await Promise.all([
                getViajes(),
                getCamionesOptions(),
                getChoferesOptions(),
                getClientesOptions(),
            ]);

            setViajes(resViajes.data || []);
            setCamiones(resCamiones.data || []);
            setChoferes(resChoferes.data || []);
            setClientes(resClientes.data || []);
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('Error al cargar el listado de viajes.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarDatos();
    }, []);

    const getCamionPatente = (idCamion: number) => {
        const encontrado = camiones.find((c) => c.id_camion === idCamion);
        if (encontrado) {
            return encontrado.patente;
        }
        return `#${idCamion}`;
    };

    const getChoferNombre = (idChofer: number) => {
        const encontrado = choferes.find((ch) => ch.id_chofer === idChofer);
        if (encontrado) {
            return encontrado.nombre_completo;
        }
        return `#${idChofer}`;
    };

    const getClienteNombre = (idCliente: number) => {
        const encontrado = clientes.find((cl) => cl.id_cliente === idCliente);
        if (encontrado) {
            return encontrado.razon_social;
        }
        return `#${idCliente}`;
    };

    const formatFecha = (fecha: string) => {
        if (!fecha) {
            return '-';
        }
        return fecha.slice(0, 10);
    };

    const getEstadoBadgeClass = (estado: string) => {
        const normalizado = estado.toLowerCase();
        if (normalizado === 'finalizado' || normalizado === 'completado') {
            return 'badge badge-success';
        }
        if (normalizado === 'en_curso' || normalizado === 'en curso') {
            return 'badge badge-accent';
        }
        if (normalizado === 'pendiente') {
            return 'badge badge-warning';
        }
        return 'badge';
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
    const viajesFiltrados = viajes.filter((item) => {
        if (!term) {
            return true;
        }
        const patente = getCamionPatente(item.id_camion).toLowerCase();
        const chofer = getChoferNombre(item.id_chofer).toLowerCase();
        const cliente = getClienteNombre(item.id_cliente).toLowerCase();

        return (
            String(item.id_viaje).includes(term) ||
            item.remito.toLowerCase().includes(term) ||
            item.destino.toLowerCase().includes(term) ||
            item.estado.toLowerCase().includes(term) ||
            patente.includes(term) ||
            chofer.includes(term) ||
            cliente.includes(term)
        );
    });

    const totalItems = viajesFiltrados.length;
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
    const viajesPaginados = viajesFiltrados.slice(startIndex, endIndex);

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
            <span className="page-breadcrumb">OPERACIONES / VIAJES</span>
            <h2>Viajes</h2>
            <p>Consultá y gestioná los traslados, cargas y unidades asignadas.</p>
            </div>

            <Link to="/viajes/nuevo" className="btn-outline">
            Nuevo viaje
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
            <strong>{totalItems}</strong> viajes encontrados
            </span>
        </div>

        <div className="card">
            <div className="card-toolbar">
            <div className="control-group">
                <label htmlFor="search-viajes">Buscar viajes</label>
                <div className="search-box viajes-search-box">
                <Search size={16} className="search-icon" />
                <input
                    id="search-viajes"
                    type="text"
                    className="search-input"
                    placeholder="Buscar por remito, destino, patente, chofer o cliente..."
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
                <label htmlFor="page-size-viajes">Registros por página</label>
                <select
                id="page-size-viajes"
                className="select-field"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                <option value={5}>5 viajes</option>
                <option value={10}>10 viajes</option>
                <option value={25}>25 viajes</option>
                </select>
            </div>
            </div>

            <div className="table-scroll">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="viajes-id-col">ID</th>
                    <th>Remito</th>
                    <th>Fecha carga</th>
                    <th>Destino</th>
                    <th>Cliente</th>
                    <th>Camión</th>
                    <th>Chofer</th>
                    <th className="viajes-num-col">Kgs</th>
                    <th className="viajes-estado-col">Estado</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                    <td colSpan={9} className="table-empty">
                        Cargando registros...
                    </td>
                    </tr>
                )}

                {!loading && viajesPaginados.length === 0 && (
                    <tr>
                    <td colSpan={9} className="table-empty">
                        No se encontraron viajes.
                    </td>
                    </tr>
                )}

                {!loading &&
                    viajesPaginados.map((item) => {
                    let remitoTexto = item.remito;
                    if (!remitoTexto) {
                        remitoTexto = `Viaje #${item.id_viaje}`;
                    }

                    return (
                        <tr key={item.id_viaje}>
                        <td className="viajes-id-col">{item.id_viaje}</td>
                        <td>
                            <Link to={`/viajes/${item.id_viaje}`} className="record-link">
                            {remitoTexto}
                            </Link>
                        </td>
                        <td className="viajes-num-col">{formatFecha(item.fecha_carga)}</td>
                        <td>{item.destino}</td>
                        <td>{getClienteNombre(item.id_cliente)}</td>
                        <td>{getCamionPatente(item.id_camion)}</td>
                        <td>{getChoferNombre(item.id_chofer)}</td>
                        <td className="viajes-num-col">{item.kgs} kg</td>
                        <td className="viajes-estado-col">
                            <span className={getEstadoBadgeClass(item.estado)}>{item.estado}</span>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
            </table>
            </div>

            <div className="pagination-bar">
            <span>
                {fromRecord}–{toRecord} de {totalItems} viajes
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