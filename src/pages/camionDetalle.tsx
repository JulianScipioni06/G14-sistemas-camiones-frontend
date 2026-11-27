import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, X } from 'lucide-react';
import {
    getCamionById,
    createCamion,
    updateCamion,
    deleteCamion,
    type CamionPayload,
} from '../services/camion.service';
import type { ApiResponse, Camion } from '../types/models';
import '../styles/ui.css';
import '../styles/camiones.css';

const ESTADOS_BASE = ['Disponible', 'En viaje', 'En reparación'];

type ErrorApi = ApiResponse<null> & { errores?: string[] };

const obtenerMensajeError = (err: unknown, porDefecto: string): string => {
    const data = (err as AxiosError<ErrorApi>).response?.data;
    if (data?.errores && data.errores.length > 0) {
        return data.errores.join('. ');
    }
    if (data?.msg) {
        return data.msg;
    }
    return porDefecto;
};

export const CamionDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === undefined;

    const [registro, setRegistro] = useState<Camion | null>(null);
    const [isEditing, setIsEditing] = useState(isNew);

    const [patenteInput, setPatenteInput] = useState('');
    const [marcaInput, setMarcaInput] = useState('');
    const [modeloInput, setModeloInput] = useState('');
    const [capacidadInput, setCapacidadInput] = useState('');
    const [taraInput, setTaraInput] = useState('');
    const [estadoInput, setEstadoInput] = useState('Disponible');
    const [kmsInput, setKmsInput] = useState('0');
    const [vtvInput, setVtvInput] = useState('');
    const [seguroInput, setSeguroInput] = useState('');

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const activeEditing = isNew || isEditing;

    const poblarFormulario = (c: Camion) => {
        setPatenteInput(c.patente);
        setMarcaInput(c.marca);
        setModeloInput(c.modelo);
        setCapacidadInput(String(c.capacidad));
        setTaraInput(String(c.tara));
        setEstadoInput(c.estado);
        setKmsInput(String(c.kms_recorridos));
        setVtvInput(c.vencimiento_vtv.slice(0, 10));
        setSeguroInput(c.vencimiento_seguro.slice(0, 10));
    };

    useEffect(() => {
        if (isNew) {
            return;
        }

        const cargar = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getCamionById(Number(id));
                setRegistro(res.data);
                poblarFormulario(res.data);
                setIsEditing(false);
            } catch (err) {
                setError(obtenerMensajeError(err, 'No se pudo cargar la información del camión.'));
            } finally {
                setLoading(false);
            }
        };

        void cargar();
    }, [id, isNew]);

    const handleCancelEdit = () => {
        if (isNew) {
            navigate('/camiones');
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

        if (!patenteInput.trim()) {
            setError('La patente es obligatoria.');
            return;
        }
        if (patenteInput.trim().length > 10) {
            setError('La patente no puede superar los 10 caracteres.');
            return;
        }
        if (!marcaInput.trim() || !modeloInput.trim()) {
            setError('La marca y el modelo son obligatorios.');
            return;
        }
        if (!vtvInput || !seguroInput) {
            setError('Los vencimientos de VTV y seguro son obligatorios.');
            return;
        }

        const capacidadNum = Number(capacidadInput);
        const taraNum = Number(taraInput);
        const kmsNum = Number(kmsInput);

        if (capacidadInput === '' || !Number.isInteger(capacidadNum) || capacidadNum < 0) {
            setError('La capacidad debe ser un entero mayor o igual a 0.');
            return;
        }
        if (taraInput === '' || !Number.isInteger(taraNum) || taraNum < 0) {
            setError('La tara debe ser un entero mayor o igual a 0.');
            return;
        }
        if (kmsInput === '' || !Number.isInteger(kmsNum) || kmsNum < 0) {
            setError('Los kms recorridos deben ser un entero mayor o igual a 0.');
            return;
        }

        const payload: CamionPayload = {
            patente: patenteInput.trim().toUpperCase(),
            marca: marcaInput.trim(),
            modelo: modeloInput.trim(),
            capacidad: capacidadNum,
            tara: taraNum,
            estado: estadoInput,
            kms_recorridos: kmsNum,
            vencimiento_vtv: vtvInput,
            vencimiento_seguro: seguroInput,
        };

        try {
            setSaving(true);
            if (isNew) {
                await createCamion(payload);
                navigate('/camiones');
                return;
            }

            const res = await updateCamion(Number(id), payload);
            setRegistro(res.data);
            poblarFormulario(res.data);
            setIsEditing(false);
            setSuccess(res.msg || 'Camión actualizado correctamente.');
        } catch (err) {
            setError(obtenerMensajeError(err, 'Error al guardar los datos del camión.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!registro) {
            return;
        }

        const confirmado = window.confirm(
            `¿Seguro que querés eliminar el camión "${registro.patente}"?`
        );
        if (!confirmado) {
            return;
        }

        try {
            setSaving(true);
            await deleteCamion(registro.id_camion);
            navigate('/camiones');
        } catch (err) {
            setError(
                obtenerMensajeError(
                    err,
                    'No se pudo eliminar el camión (verificá que no tenga viajes o reparaciones asociadas).'
                )
            );
            setSaving(false);
        }
    };

    const opcionesEstado = [...ESTADOS_BASE];
    if (estadoInput && !opcionesEstado.includes(estadoInput)) {
        opcionesEstado.push(estadoInput);
    }

    let breadcrumbText = 'FLOTA / CAMIONES';
    let pageTitle = 'Detalle del camión';
    let pageSubtitle = 'Datos del vehículo, documentación y estado.';
    let cardHeading = '';

    if (isNew) {
        breadcrumbText = 'CAMIONES / NUEVO';
        pageTitle = 'Nuevo camión';
        pageSubtitle = 'Completá los datos para registrar un camión.';
        cardHeading = 'Datos del camión';
    } else if (registro) {
        cardHeading = `Patente ${registro.patente}`;
    }

    let saveButtonLabel = 'Guardar cambios';
    if (isNew) {
        saveButtonLabel = 'Crear camión';
    }
    if (saving) {
        saveButtonLabel = 'Guardando...';
    }

    return (
        <div className="page-container">
            <Link to="/camiones" className="back-link">
                <ArrowLeft size={15} />
                Volver a camiones
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
                                <label htmlFor="detail-id">ID Camión</label>
                                <input
                                    id="detail-id"
                                    type="text"
                                    className="input-field"
                                    value={registro.id_camion}
                                    readOnly
                                />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="detail-patente">Patente</label>
                            <input
                                id="detail-patente"
                                type="text"
                                className="input-field"
                                placeholder="Ej: AB123CD"
                                maxLength={10}
                                value={patenteInput}
                                onChange={(e) => setPatenteInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-marca">Marca</label>
                            <input
                                id="detail-marca"
                                type="text"
                                className="input-field"
                                placeholder="Ej: Scania"
                                maxLength={40}
                                value={marcaInput}
                                onChange={(e) => setMarcaInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-modelo">Modelo</label>
                            <input
                                id="detail-modelo"
                                type="text"
                                className="input-field"
                                placeholder="Ej: R450"
                                maxLength={50}
                                value={modeloInput}
                                onChange={(e) => setModeloInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-capacidad">Capacidad (kg)</label>
                            <input
                                id="detail-capacidad"
                                type="number"
                                min="0"
                                step="1"
                                className="input-field"
                                placeholder="Ej: 28000"
                                value={capacidadInput}
                                onChange={(e) => setCapacidadInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-tara">Tara (kg)</label>
                            <input
                                id="detail-tara"
                                type="number"
                                min="0"
                                step="1"
                                className="input-field"
                                placeholder="Ej: 8500"
                                value={taraInput}
                                onChange={(e) => setTaraInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-kms">Kms recorridos</label>
                            <input
                                id="detail-kms"
                                type="number"
                                min="0"
                                step="1"
                                className="input-field"
                                value={kmsInput}
                                onChange={(e) => setKmsInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-vtv">Vencimiento VTV</label>
                            <input
                                id="detail-vtv"
                                type="date"
                                className="input-field"
                                value={vtvInput}
                                onChange={(e) => setVtvInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-seguro">Vencimiento seguro</label>
                            <input
                                id="detail-seguro"
                                type="date"
                                className="input-field"
                                value={seguroInput}
                                onChange={(e) => setSeguroInput(e.target.value)}
                                readOnly={!activeEditing}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="detail-estado">Estado</label>
                            <select
                                id="detail-estado"
                                className="select-field"
                                value={estadoInput}
                                onChange={(e) => setEstadoInput(e.target.value)}
                                disabled={!activeEditing}
                            >
                                {opcionesEstado.map((est) => (
                                    <option key={est} value={est}>
                                        {est}
                                    </option>
                                ))}
                            </select>
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