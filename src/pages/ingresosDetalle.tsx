import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ingresosService } from '../services/ingresos.service';

interface ViajeOption {
    id_viaje: number;
    remito: string | null;
    destino: string;
    fecha_carga: string;
    id_cliente: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const IngresoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const esEdicion = Boolean(id && id !== 'nuevo');

    const [modoEditar, setModoEditar] = useState(!esEdicion);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [viajes, setViajes] = useState<ViajeOption[]>([]);

    const [form, setForm] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    metodo_pago: 'Transferencia',
    estado: 'Pendiente',
    id_viaje: '',
    id_cliente: '',
    });

    // Cargar lista de viajes para el desplegable
    useEffect(() => {
    fetch(`${API_URL}/viajes?limit=100`)
        .then((res) => res.json())
        .then((json) => {
        if (Array.isArray(json.data)) setViajes(json.data);
        })
        .catch((err) => console.error('Error al cargar viajes:', err));
    }, []);

    // Cargar datos del ingreso solo si es edición real
    useEffect(() => {
    if (!esEdicion) return;

    ingresosService
        .getById(Number(id))
        .then((data) => {
        setForm({
            concepto: data.concepto,
            monto: String(data.monto),
            fecha: data.fecha,
            metodo_pago: data.metodo_pago ?? '',
            estado: data.estado,
            id_viaje: data.id_viaje ? String(data.id_viaje) : '',
            id_cliente: data.id_cliente ? String(data.id_cliente) : '',
        });
        })
        .catch(() => setError('No se pudo cargar el ingreso'));
    }, [id, esEdicion]);

    // Al elegir un viaje, autocompleta viaje, cliente y sugiere concepto
    const handleSeleccionarViaje = (idViajeSeleccionado: string) => {
    const viajeEncontrado = viajes.find((v) => String(v.id_viaje) === idViajeSeleccionado);

    if (!viajeEncontrado) {
        setForm({ ...form, id_viaje: '' });
        return;
    }

    const conceptoSugerido = `Flete ${viajeEncontrado.remito ? `Remito ${viajeEncontrado.remito}` : `Viaje #${viajeEncontrado.id_viaje}`} - ${viajeEncontrado.destino}`;

    setForm((prev) => ({
        ...prev,
        id_viaje: String(viajeEncontrado.id_viaje),
        id_cliente: viajeEncontrado.id_cliente ? String(viajeEncontrado.id_cliente) : prev.id_cliente,
        concepto: prev.concepto.trim() === '' ? conceptoSugerido : prev.concepto,
    }));
    };

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
        concepto: form.concepto,
        monto: Number(form.monto),
        fecha: form.fecha,
        metodo_pago: form.metodo_pago || null,
        estado: form.estado,
        id_viaje: form.id_viaje ? Number(form.id_viaje) : null,
        id_cliente: form.id_cliente ? Number(form.id_cliente) : null,
    };

    try {
        if (esEdicion && id) {
        await ingresosService.update(Number(id), payload);
        setModoEditar(false);
        setSuccess('Ingreso actualizado correctamente.');
        } else {
        await ingresosService.create(payload);
        navigate('/ingresos');
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error');
    }
    };

    const handleEliminar = async () => {
    if (!esEdicion || !window.confirm('¿Seguro que querés eliminar este ingreso?')) return;
    try {
        await ingresosService.remove(Number(id));
        navigate('/ingresos');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
    };

    return (
    <div className="page-container">
        <Link to="/ingresos" className="back-link">
        ← Volver a ingresos
        </Link>

        <div className="page-header">
        <div className="page-title-group">
            <span className="page-breadcrumb">FINANZAS / INGRESOS</span>
            <h2>{esEdicion ? 'Detalle del ingreso' : 'Nuevo ingreso'}</h2>
            <p>
            {esEdicion
                ? 'Visualizá o editá los datos del movimiento.'
                : 'Completá los datos para registrar un nuevo ingreso.'}
            </p>
        </div>

        {esEdicion && (
            <div className="page-header-actions">
            {!modoEditar && (
                <button type="button" className="btn-outline" onClick={() => setModoEditar(true)}>
                Editar
                </button>
            )}
            <button type="button" className="btn-danger-outline" onClick={handleEliminar}>
                Eliminar
            </button>
            </div>
        )}
        </div>

        {error && (
        <div className="alert alert-error">
            <span>{error}</span>
            <button type="button" className="alert-close" onClick={() => setError('')}>
            ✕
            </button>
        </div>
        )}

        {success && (
        <div className="alert alert-success">
            <span>{success}</span>
            <button type="button" className="alert-close" onClick={() => setSuccess('')}>
            ✕
            </button>
        </div>
        )}

        <form className="card" onSubmit={handleSubmit}>
        <div className="card-detail-header">
            <h3>{esEdicion ? `Ingreso #${id}` : 'Datos del ingreso'}</h3>
        </div>

        <div className="form-grid">
            {esEdicion && (
            <div className="form-field">
                <label>ID</label>
                <input type="text" className="input-field" value={id} readOnly />
            </div>
            )}

            <div className="form-field">
            <label>Viaje asociado (opcional)</label>
            <select
                className="select-field"
                disabled={!modoEditar}
                value={form.id_viaje}
                onChange={(e) => handleSeleccionarViaje(e.target.value)}
            >
                <option value="">Sin viaje asociado</option>
                {viajes.map((v) => (
                <option key={v.id_viaje} value={v.id_viaje}>
                    #{v.id_viaje} · {v.remito ? `Remito ${v.remito}` : 'Sin remito'} ({v.destino})
                </option>
                ))}
            </select>
            </div>

            <div className="form-field">
            <label>Concepto *</label>
            <input
                type="text"
                className="input-field"
                required
                readOnly={!modoEditar}
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            />
            </div>

            <div className="form-field">
            <label>Monto *</label>
            <input
                type="number"
                step="0.01"
                className="input-field"
                required
                readOnly={!modoEditar}
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
            </div>

            <div className="form-field">
            <label>Fecha *</label>
            <input
                type="date"
                className="input-field"
                required
                readOnly={!modoEditar}
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />  
            </div>

            <div className="form-field">
            <label>Método de pago</label>
            <select
                className="select-field"
                disabled={!modoEditar}
                value={form.metodo_pago}
                onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
            >
                <option value="">Sin especificar</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="E-Cheq">E-Cheq</option>
            </select>
            </div>

            <div className="form-field">
            <label>Estado *</label>
            <select
                className="select-field"
                required
                disabled={!modoEditar}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
                <option value="Pendiente">Pendiente</option>
                <option value="Cobrado">Cobrado</option>
                <option value="Vencido">Vencido</option>
            </select>
            </div>

            <div className="form-field">
            <label>ID Cliente (opcional)</label>
            <input
                type="number"
                className="input-field"
                readOnly={!modoEditar}
                value={form.id_cliente}
                onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
            />
            </div>
        </div>

        {modoEditar && (
            <div className="card-detail-footer">
            {esEdicion && (
                <button type="button" className="btn-outline" onClick={() => setModoEditar(false)}>
                Cancelar
                </button>
            )}
            <button type="submit" className="btn-primary">
                {esEdicion ? 'Guardar cambios' : 'Crear ingreso'}
            </button>
            </div>
        )}
        </form>
    </div>
    );
};