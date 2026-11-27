import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { IdCard, Search, X } from 'lucide-react';
import { getChoferes } from '../services/chofer.service';
import type { ApiResponse, Chofer } from '../types/models';
import '../styles/ui.css';
import '../styles/choferes.css';

export const Choferes = () => {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarChoferes = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getChoferes();
        setChoferes(res.data || []);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        if (axiosError.response?.data?.msg) {
          setError(axiosError.response.data.msg);
        } else {
          setError('Error al cargar el listado de choferes.');
        }
      } finally {
        setLoading(false);
      }
    };

    void cargarChoferes();
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
  const choferesFiltrados = choferes.filter((item) => {
    if (!term) {
      return true;
    }
    return (
      String(item.id_chofer).includes(term) ||
      item.nombre_completo.toLowerCase().includes(term) ||
      item.dni.toLowerCase().includes(term) ||
      item.telefono.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term)
    );
  });

  const totalItems = choferesFiltrados.length;
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
  const choferesPaginados = choferesFiltrados.slice(startIndex, endIndex);

  let fromRecord = 0;
  let toRecord = 0;
  if (totalItems > 0) {
    fromRecord = startIndex + 1;
    toRecord = Math.min(endIndex, totalItems);
  }

  const getCarnetBadgeClass = (fechaVencimiento: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(`${fechaVencimiento}T00:00:00`);
    const diffDias = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return 'badge badge-danger';
    }
    if (diffDias <= 30) {
      return 'badge badge-warning';
    }
    return 'badge badge-success';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <span className="page-breadcrumb">FLOTA / CHOFERES</span>
          <h2>Choferes</h2>
          <p>Consultá los conductores registrados, sus datos de contacto y vencimientos de carnet.</p>
        </div>

        <Link to="/choferes/nuevo" className="btn-outline">
          Nuevo chofer
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
        <IdCard size={18} />
        <span>
          <strong>{totalItems}</strong> choferes encontrados
        </span>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="control-group">
            <label htmlFor="search-choferes">Buscar choferes</label>
            <div className="search-box choferes-search-box">
              <Search size={16} className="search-icon" />
              <input
                id="search-choferes"
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, DNI, teléfono, email o ID..."
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
            <label htmlFor="page-size-choferes">Registros por página</label>
            <select
              id="page-size-choferes"
              className="select-field"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5 choferes</option>
              <option value={10}>10 choferes</option>
              <option value={25}>25 choferes</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="choferes-id-col">ID</th>
                <th>Nombre completo</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th className="choferes-carnet-col">Venc. Carnet</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Cargando registros...
                  </td>
                </tr>
              )}

              {!loading && choferesPaginados.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No se encontraron choferes.
                  </td>
                </tr>
              )}

              {!loading &&
                choferesPaginados.map((item) => (
                  <tr key={item.id_chofer}>
                    <td className="choferes-id-col">{item.id_chofer}</td>
                    <td>
                      <Link to={`/choferes/${item.id_chofer}`} className="record-link">
                        {item.nombre_completo}
                      </Link>
                    </td>
                    <td>{item.dni}</td>
                    <td>{item.telefono}</td>
                    <td>{item.email}</td>
                    <td className="choferes-carnet-col">
                      <span className={getCarnetBadgeClass(item.vencimiento_carnet)}>
                        {item.vencimiento_carnet}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>
            {fromRecord}–{toRecord} de {totalItems} choferes
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