import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ingresosService } from '../services/ingresos.service';
import type { Ingreso } from '../types/models';
import '../styles/ui.css';

export const Ingresos = () => {
    const navigate = useNavigate();

    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');
    const [loading, setLoading] = useState(false);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    useEffect(() => {
    const fetchIngresos = async () => {
        setLoading(true);
        try {
        const res = await ingresosService.getAll({ page, limit, search, estado });
        setIngresos(res.data);
        setTotal(res.total);
        } catch (error) {
        console.error(error);
        } finally {
        setLoading(false);
        }
    };

    fetchIngresos();
    }, [page, limit, search, estado]);

    const handleExportarReporte = () => {
    const headers = ['ID', 'Concepto', 'Monto', 'Fecha', 'Metodo Pago', 'Estado', 'ID Viaje', 'ID Cliente'];
    const rows = ingresos.map((i) => [
        i.id_ingreso,
        `"${i.concepto}"`,
        i.monto,
        i.fecha,
        i.metodo_pago ?? '-',
        i.estado,
        i.id_viaje ?? '-',
        i.id_cliente ?? '-',
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ingresos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    };

    const getBadgeClass = (estadoIngreso: string) => {
    const normalizado = estadoIngreso.toLowerCase();
    if (normalizado === 'cobrado') return 'badge badge-success';
    if (normalizado === 'pendiente') return 'badge badge-warning';
    return 'badge badge-accent';
    };

    return (
    <div className="page-container">
        <div className="page-header">
        <div className="page-title-group">
            <span className="page-breadcrumb">FINANZAS / INGRESOS</span>
            <h2>Ingresos</h2>
            <p>Consultá y gestioná los ingresos por fletes y servicios.</p>
        </div>
        <div className="page-header-actions">
            <button type="button" className="btn-outline" onClick={handleExportarReporte}>
            Exportar reporte
            </button>
            <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/ingresos/nuevo')}
            >
            Nuevo ingreso
            </button>
        </div>
        </div>

        <div className="count-banner">
        <strong>{total}</strong> ingresos encontrados
        </div>

        <div className="card">
        <div className="card-toolbar">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="control-group">
                <label htmlFor="search-ingresos">Buscar ingresos</label>
                <div className="search-box">
                <span className="search-icon"></span>
                <input
                    id="search-ingresos"
                    type="text"
                    className="search-input"
                    placeholder="Buscar por concepto..."
                    value={search}
                    onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    }}
                />
                {search && (
                    <button
                    type="button"
                    className="search-clear"
                    onClick={() => {
                        setSearch('');
                        setPage(1);
                    }}
                    >
                    ✕
                    </button>
                )}
                </div>
            </div>

            <div className="control-group">
                <label htmlFor="estado-ingresos">Estado</label>
                <select
                id="estado-ingresos"
                className="select-field"
                value={estado}
                onChange={(e) => {
                    setEstado(e.target.value);
                    setPage(1);
                }}
                >
                <option value="">Todos</option>
                <option value="Cobrado">Cobrado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Vencido">Vencido</option>
                </select>
            </div>
            </div>

            <div className="control-group">
            <label htmlFor="limit-ingresos">Registros por página</label>
            <select
                id="limit-ingresos"
                className="select-field"
                value={limit}
                onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
                }}
            >
                <option value={5}>5 ingresos</option>
                <option value={10}>10 ingresos</option>
                <option value={20}>20 ingresos</option>
            </select>
            </div>
        </div>

        <div className="table-scroll">
            <table className="data-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Método de pago</th>
                <th>Viaje / Cliente</th>
                <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr>
                    <td colSpan={7} className="table-empty">
                    Cargando ingresos...
                    </td>
                </tr>
                ) : ingresos.length === 0 ? (
                <tr>
                    <td colSpan={7} className="table-empty">
                    No se encontraron registros.
                    </td>
                </tr>
                ) : (
                ingresos.map((item) => (
                    <tr
                    key={item.id_ingreso}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/ingresos/${item.id_ingreso}`)}
                    >
                    <td>{item.id_ingreso}</td>
                    <td>
                        <Link
                        to={`/ingresos/${item.id_ingreso}`}
                        className="record-link"
                        onClick={(e) => e.stopPropagation()}
                        >
                        {item.concepto}
                        </Link>
                    </td>
                    <td>
                        ${Number(item.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>{item.fecha.split('-').reverse().join('/')}</td>
                    <td>{item.metodo_pago || '-'}</td>
                    <td>
                        Viaje: {item.id_viaje ?? '-'} · Cliente: {item.id_cliente ?? '-'}
                    </td>
                    <td>
                        <span className={getBadgeClass(item.estado)}>{item.estado}</span>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        <div className="pagination-bar">
            <span>
            {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total} ingresos
            </span>
            <div className="pagination-controls">
            <button
                type="button"
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
            >
                Anterior
            </button>
            <span className="page-number">{page}</span>
            <button
                type="button"
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
            >
                Siguiente
            </button>
            </div>
        </div>
        </div>
    </div>
    );
};