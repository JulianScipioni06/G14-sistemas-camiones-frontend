import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, X } from 'lucide-react';
import {
    getIncidenciaById,
    createIncidencia,
    updateIncidencia,
    deleteIncidencia,
    type IncidenciaPayload,
} from '../services/incidencia.service';
import { getViajes } from '../services/viaje.service';
import type { ApiResponse, Incidencia, Viaje } from '../types/models';
import '../styles/ui.css';
import '../styles/incidencias.css';

const getCurrentDatetimeLocal = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offsetMs).toISOString();
    return localISOTime.slice(0, 16);
};

const toDatetimeLocalValue = (fechaHora: string) => {
    if (!fechaHora) {
        return '';
    }
    const parsed = new Date(fechaHora);
    if (Number.isNaN(parsed.getTime())) {
        return fechaHora.slice(0, 16);
    }
    const offsetMs = parsed.getTimezoneOffset() * 60000;
    const localISOTime = new Date(parsed.getTime() - offsetMs).toISOString();
    return localISOTime.slice(0, 16);
};

export const IncidenciaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === undefined;

    const [registro, setRegistro] = useState<Incidencia | null>(null);
    const [isEditing, setIsEditing] = useState(isNew);
    const [viajes, setViajes] = useState<Viaje[]>([]);

    const [descripcionInput, setDescripcionInput] = useState('');
    const [fechaHoraInput, setFechaHoraInput] = useState(() => {
        if (isNew) {
            return getCurrentDatetimeLocal();
        }
        return '';
    });
    const [viajeInput, setViajeInput] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const activeEditing = isNew || isEditing;

    const poblarFormulario = (inc: Incidencia) => {
        setDescripcionInput(inc.descripcion);
        setFechaHoraInput(toDatetimeLocalValue(inc.fecha_hora));
        setViajeInput(String(inc.id_viaje));
    };

    useEffect(() => {
        const cargarTodo = async () => {
        try {
            setLoading(true);
            setError('');

            const resViajes = await getViajes();
            setViajes(resViajes.data || []);

            if (!isNew) {
                const resIncidencia = await getIncidenciaById(Number(id));
                setRegistro(resIncidencia.data);
                poblarFormulario(resIncidencia.data);
                setIsEditing(false);
            }
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('No se pudo cargar la información de la incidencia.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarTodo();
    }, [id, isNew]);

    const handleCancelEdit = () => {
        if (isNew) {
            navigate('/incidencias');
            return;
        }

        if (registro) {
            poblarFormulario(registro);
        }
        setError('');
        setIsEditing(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!viajeInput) {
            setError('Debés seleccionar un viaje asociado.');
            return;
        }
        if (!fechaHoraInput.trim()) {
            setError('La fecha y hora son obligatorias.');
            return;
        }
        if (!descripcionInput.trim()) {
            setError('La descripción de la incidencia es obligatoria.');
            return;
        }

        const parsedDate = new Date(fechaHoraInput);
        if (Number.isNaN(parsedDate.getTime())) {
            setError('La fecha y hora ingresadas no son válidas.');
            return;
        }

        const payload: IncidenciaPayload = {
            descripcion: descripcionInput.trim(),
            fecha_hora: parsedDate.toISOString(),
            id_viaje: Number(viajeInput),
        };

        try {
            setSaving(true);
            if (isNew) {
                await createIncidencia(payload);
                navigate('/incidencias');
                return;
            }

            const res = await updateIncidencia(Number(id), payload);
                setRegistro(res.data);
                poblarFormulario(res.data);
                setIsEditing(false);
                setSuccess(res.msg || 'Incidencia actualizada correctamente.');
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('Error al guardar los datos de la incidencia.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!registro) {
            return;
        }

        const confirmado = window.confirm(
        `¿Seguro que querés eliminar la incidencia #${registro.id_incidencia}?`
        );
        if (!confirmado) {
            return;
        }

        try {
            setSaving(true);
            await deleteIncidencia(registro.id_incidencia);
            navigate('/incidencias');
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('No se pudo eliminar la incidencia.');
            }
            setSaving(false);
        }
    };

    let breadcrumbText = 'OPERACIONES / INCIDENCIAS';
    let pageTitle = 'Detalle de la incidencia';
    let pageSubtitle = 'Registro del inconveniente y viaje asociado.';
    let cardHeading = '';

    if (isNew) {
        breadcrumbText = 'INCIDENCIAS / NUEVA';
        pageTitle = 'Nueva incidencia';
        pageSubtitle = 'Completá los datos para reportar una novedad en un viaje.';
        cardHeading = 'Datos de la incidencia';
    } else if (registro) {
        cardHeading = `Incidencia #${registro.id_incidencia}`;
    }

    let saveButtonLabel = 'Guardar cambios';
    if (isNew) {
        saveButtonLabel = 'Registrar incidencia';
    }
    if (saving) {
        saveButtonLabel = 'Guardando...';
    }

    return (
        <div className="page-container">
        <Link to="/incidencias" className="back-link">
            <ArrowLeft size={15} />
            Volver a incidencias
        </Link>

        <div className="page-header">
            <div className="page-title-group">
            <span className="page-breadcrumb">{breadcrumbText}</span>
            <h2>{pageTitle}</h2>
            <p>{pageSubtitle}</p>
            </div>

            {!isNew && !activeEditing && registro && (
            <div className="page-header-actions">
                <button
                type="button"
                className="btn-outline"
                onClick={() => {
                    setSuccess('');
                    setIsEditing(true);
                }}
                >
                Editar
                </button>
                <button
                type="button"
                className="btn-danger-outline"
                onClick={handleDelete}
                disabled={saving}
                >
                Eliminar
                </button>
            </div>
            )}
        </div>

        {error && (
            <div className="alert alert-error" role="alert">
            <span>{error}</span>
            <button type="button" className="alert-close" onClick={() => setError('')}>
                <X size={16} />
            </button>
            </div>
        )}

        {success && (
            <div className="alert alert-success" role="status">
            <span>{success}</span>
            <button type="button" className="alert-close" onClick={() => setSuccess('')}>
                <X size={16} />
            </button>
            </div>
        )}

        {loading && <p>Cargando información del registro...</p>}

        {!loading && (isNew || registro) && (
            <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="card-detail-header">
                <h3>{cardHeading}</h3>
            </div>

            <div className="form-grid">
                {!isNew && registro && (
                <div className="form-field">
                    <label htmlFor="detail-id">ID Incidencia</label>
                    <input
                    id="detail-id"
                    type="text"
                    className="input-field"
                    value={registro.id_incidencia}
                    readOnly
                    />
                </div>
                )}

                <div className="form-field">
                <label htmlFor="detail-viaje">Viaje asociado</label>
                <select
                    id="detail-viaje"
                    className="select-field"
                    value={viajeInput}
                    onChange={(e) => setViajeInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    <option value="">Seleccioná un viaje...</option>
                    {viajes.map((v) => (
                    <option key={v.id_viaje} value={v.id_viaje}>
                        {v.remito} · {v.destino} ({v.fecha_carga.slice(0, 10)})
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-field">
                <label htmlFor="detail-fecha-hora">Fecha y hora</label>
                <input
                    id="detail-fecha-hora"
                    type="datetime-local"
                    className="input-field"
                    value={fechaHoraInput}
                    onChange={(e) => setFechaHoraInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field form-field-full">
                <label htmlFor="detail-descripcion">Descripción</label>
                <textarea
                    id="detail-descripcion"
                    rows={4}
                    className="textarea-field"
                    placeholder="Describí el inconveniente o novedad ocurrida durante el traslado..."
                    value={descripcionInput}
                    onChange={(e) => setDescripcionInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>
            </div>

            {activeEditing && (
                <div className="card-detail-footer">
                <button
                    type="button"
                    className="btn-outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                >
                    Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saveButtonLabel}
                </button>
                </div>
            )}
            </form>
        )}
        </div>
    );
};