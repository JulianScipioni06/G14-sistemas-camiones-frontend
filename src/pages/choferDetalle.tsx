import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, Trash2, Save, X } from 'lucide-react';
import {
  getChoferById,
  getChoferes,
  createChofer,
  updateChofer,
  deleteChofer,
} from '../services/chofer.service';
import { getUsuarios } from '../services/usuario.service';
import type { ApiResponse, Usuario } from '../types/models';
import '../styles/ui.css';
import '../styles/choferes.css';

export const ChoferDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'nuevo';

  const [dni, setDni] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [email, setEmail] = useState('');
  const [vencimientoCarnet, setVencimientoCarnet] = useState('');
  const [idUsuario, setIdUsuario] = useState<number | ''>('');

  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');

        const [usuariosRes, choferesRes] = await Promise.all([
          getUsuarios(),
          getChoferes(1, 500),
        ]);

        const todosUsuarios = usuariosRes.data || [];
        const todosChoferes = choferesRes.data || [];

        let usuarioActualId: number | null = null;

        if (!isNew) {
          const choferRes = await getChoferById(Number(id));
          const chofer = choferRes.data;
          if (chofer) {
            setDni(chofer.dni);
            setNombreCompleto(chofer.nombre_completo);
            setTelefono(chofer.telefono);
            setDomicilio(chofer.domicilio);
            setEmail(chofer.email);
            setVencimientoCarnet(chofer.vencimiento_carnet);
            setIdUsuario(chofer.id_usuario);
            usuarioActualId = chofer.id_usuario;
          }
        }

        // Filtrar usuarios con rol 'chofer' que no estén asignados a otro chofer (relación 1:1)
        const idsOcupados = new Set(
          todosChoferes
            .filter((c) => c.id_usuario !== usuarioActualId)
            .map((c) => c.id_usuario)
        );

        const disponibles = todosUsuarios.filter(
          (u) => u.rol === 'chofer' && !idsOcupados.has(u.id_usuario)
        );

        setUsuariosDisponibles(disponibles);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        setError(axiosError.response?.data?.msg || 'Error al cargar los datos del chofer.');
      } finally {
        setLoading(false);
      }
    };

    void cargarDatos();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idUsuario === '') {
      setError('Debés seleccionar una cuenta de usuario para el chofer.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        dni: dni.trim(),
        nombre_completo: nombreCompleto.trim(),
        telefono: telefono.trim(),
        domicilio: domicilio.trim(),
        email: email.trim(),
        vencimiento_carnet: vencimientoCarnet,
        id_usuario: Number(idUsuario),
      };

      if (isNew) {
        await createChofer(payload);
      } else {
        await updateChofer(Number(id), payload);
      }

      navigate('/choferes');
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<null>>;
      setError(
        axiosError.response?.data?.msg ||
          (isNew ? 'Error al crear el chofer.' : 'Error al actualizar el chofer.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar al chofer "${nombreCompleto}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      setSaving(true);
      setError('');
      await deleteChofer(Number(id));
      navigate('/choferes');
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<null>>;
      setError(
        axiosError.response?.data?.msg ||
          'No se pudo eliminar el chofer (verificá que no tenga viajes asociados).'
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
            FLOTA / CHOFERES / {isNew ? 'NUEVO' : `#${id}`}
          </span>
          <h2>{isNew ? 'Nuevo chofer' : `Chofer #${id}`}</h2>
          <p>
            {isNew
              ? 'Registrá los datos personales, licencia y cuenta de acceso del chofer.'
              : 'Consultá o actualizá la información del chofer seleccionado.'}
          </p>
        </div>

        <Link to="/choferes" className="btn-outline">
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
              <label htmlFor="nombre_completo">Nombre completo *</label>
              <input
                id="nombre_completo"
                type="text"
                maxLength={100}
                required
                className="input-field"
                placeholder="Ej: Martín Alejandro Gómez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="dni">DNI *</label>
              <input
                id="dni"
                type="text"
                maxLength={15}
                required
                className="input-field"
                placeholder="Ej: 34567890"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
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
                placeholder="Ej: 2914123456"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                maxLength={100}
                required
                className="input-field"
                placeholder="chofer@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="domicilio">Domicilio *</label>
              <input
                id="domicilio"
                type="text"
                maxLength={100}
                required
                className="input-field"
                placeholder="Ej: Sarmiento 1420, Bahía Blanca"
                value={domicilio}
                onChange={(e) => setDomicilio(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="vencimiento_carnet">Vencimiento de carnet *</label>
              <input
                id="vencimiento_carnet"
                type="date"
                required
                className="input-field"
                value={vencimientoCarnet}
                onChange={(e) => setVencimientoCarnet(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="id_usuario">Cuenta de usuario (rol chofer) *</label>
              <select
                id="id_usuario"
                required
                className="select-field"
                value={idUsuario}
                onChange={(e) =>
                  setIdUsuario(e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                <option value="">Seleccionar usuario disponible...</option>
                {usuariosDisponibles.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    #{u.id_usuario} — {u.usuario}
                  </option>
                ))}
              </select>
              {usuariosDisponibles.length === 0 && (
                <small style={{ color: '#fbbf24', marginTop: '4px' }}>
                  No hay usuarios con rol "chofer" libres. Creá uno primero en Sistema / Usuarios.
                </small>
              )}
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
                  Eliminar chofer
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/choferes" className="btn-outline">
                  Cancelar
                </Link>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Guardando...' : isNew ? 'Crear chofer' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};