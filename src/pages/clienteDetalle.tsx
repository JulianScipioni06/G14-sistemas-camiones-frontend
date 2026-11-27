import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, Trash2, Save, X } from 'lucide-react';
import {
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../services/cliente.service';
import type { ApiResponse } from '../types/models';
import '../styles/ui.css';
import '../styles/clientes.css';

export const ClienteDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'nuevo';

  const [razonSocial, setRazonSocial] = useState('');
  const [cuit, setCuit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    const cargarCliente = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getClienteById(Number(id));
        const cliente = res.data;
        if (cliente) {
          setRazonSocial(cliente.razon_social);
          setCuit(cliente.cuit);
          setTelefono(cliente.telefono);
          setEmail(cliente.email || '');
          setDireccion(cliente.direccion || '');
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        setError(axiosError.response?.data?.msg || 'Error al cargar los datos del cliente.');
      } finally {
        setLoading(false);
      }
    };

    void cargarCliente();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        razon_social: razonSocial.trim(),
        cuit: cuit.trim(),
        telefono: telefono.trim(),
        email: email.trim() || null,
        direccion: direccion.trim() || null,
      };

      if (isNew) {
        await createCliente(payload);
      } else {
        await updateCliente(Number(id), payload);
      }

      navigate('/clientes');
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<null>>;
      setError(
        axiosError.response?.data?.msg ||
          (isNew ? 'Error al crear el cliente.' : 'Error al actualizar el cliente.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar al cliente "${razonSocial}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      setSaving(true);
      setError('');
      await deleteCliente(Number(id));
      navigate('/clientes');
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<null>>;
      setError(
        axiosError.response?.data?.msg ||
          'No se pudo eliminar el cliente (verificá que no tenga viajes o ingresos asociados).'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <span className="page-breadcrumb">
            COMERCIAL / CLIENTES / {isNew ? 'NUEVO' : `#${id}`}
          </span>
          <h2>{isNew ? 'Nuevo cliente' : `Cliente #${id}`}</h2>
          <p>
            {isNew
              ? 'Registrá los datos fiscales y de contacto del nuevo cliente.'
              : 'Consultá o actualizá la información del cliente seleccionado.'}
          </p>
        </div>

        <Link to="/clientes" className="btn-outline">
          <ArrowLeft size={16} />
          Volver al listado
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

      <div className="card">
        {loading ? (
          <div className="table-empty">Cargando información...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid" style={{ padding: '1.5rem' }}>
            <div className="control-group">
              <label htmlFor="razon_social">Razón Social *</label>
              <input
                id="razon_social"
                type="text"
                maxLength={100}
                required
                className="input-field"
                placeholder="Ej: Cereales Bahía S.A."
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="cuit">CUIT *</label>
              <input
                id="cuit"
                type="text"
                maxLength={13}
                required
                className="input-field"
                placeholder="Ej: 30-71122334-9"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                id="telefono"
                type="text"
                maxLength={20}
                required
                className="input-field"
                placeholder="Ej: 2914551122"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="email">Email (opcional)</label>
              <input
                id="email"
                type="email"
                maxLength={100}
                className="input-field"
                placeholder="contacto@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="control-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="direccion">Dirección (opcional)</label>
              <input
                id="direccion"
                type="text"
                maxLength={100}
                className="input-field"
                placeholder="Ej: Av. Colón 850, Bahía Blanca"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color, #2a2e39)',
                gridColumn: '1 / -1',
              }}
            >
              {!isNew ? (
                <button
                  type="button"
                  className="btn-danger"
                  disabled={saving}
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                  Eliminar cliente
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/clientes" className="btn-outline">
                  Cancelar
                </Link>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Guardando...' : isNew ? 'Crear cliente' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};