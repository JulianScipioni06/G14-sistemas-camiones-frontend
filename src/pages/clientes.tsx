import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Building2, Search, X } from 'lucide-react';
import { getClientes } from '../services/cliente.service';
import type { ApiResponse, Cliente } from '../types/models';
import '../styles/ui.css';
import '../styles/clientes.css';

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getClientes();
        setClientes(res.data || []);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        if (axiosError.response?.data?.msg) {
          setError(axiosError.response.data.msg);
        } else {
          setError('Error al cargar el listado de clientes.');
        }
      } finally {
        setLoading(false);
      }
    };

    void cargarClientes();
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
  const clientesFiltrados = clientes.filter((item) => {
    if (!term) {
      return true;
    }
    return (
      String(item.id_cliente).includes(term) ||
      item.razon_social.toLowerCase().includes(term) ||
      item.cuit.toLowerCase().includes(term) ||
      item.telefono.toLowerCase().includes(term) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.direccion && item.direccion.toLowerCase().includes(term))
    );
  });

  const totalItems = clientesFiltrados.length;
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
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

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
          <span className="page-breadcrumb">COMERCIAL / CLIENTES</span>
          <h2>Clientes</h2>
          <p>Consultá las empresas y clientes registrados, su CUIT y datos de contacto.</p>
        </div>

        <Link to="/clientes/nuevo" className="btn-outline">
          Nuevo cliente
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
        <Building2 size={18} />
        <span>
          <strong>{totalItems}</strong> clientes encontrados
        </span>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="control-group">
            <label htmlFor="search-clientes">Buscar clientes</label>
            <div className="search-box clientes-search-box">
              <Search size={16} className="search-icon" />
              <input
                id="search-clientes"
                type="text"
                className="search-input"
                placeholder="Buscar por razón social, CUIT, teléfono, email o ID..."
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
            <label htmlFor="page-size-clientes">Registros por página</label>
            <select
              id="page-size-clientes"
              className="select-field"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5 clientes</option>
              <option value={10}>10 clientes</option>
              <option value={25}>25 clientes</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="clientes-id-col">ID</th>
                <th>Razón Social</th>
                <th className="clientes-cuit-col">CUIT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
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

              {!loading && clientesPaginados.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-empty">
                    No se encontraron clientes.
                  </td>
                </tr>
              )}

              {!loading &&
                clientesPaginados.map((item) => (
                  <tr key={item.id_cliente}>
                    <td className="clientes-id-col">{item.id_cliente}</td>
                    <td>
                      <Link to={`/clientes/${item.id_cliente}`} className="record-link">
                        {item.razon_social}
                      </Link>
                    </td>
                    <td className="clientes-cuit-col">{item.cuit}</td>
                    <td>{item.telefono}</td>
                    <td>{item.email || '—'}</td>
                    <td>{item.direccion || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>
            {fromRecord}–{toRecord} de {totalItems} clientes
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