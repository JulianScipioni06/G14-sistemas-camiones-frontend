import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, X } from 'lucide-react';
import {
    getViajeById,
    createViaje,
    updateViaje,
    deleteViaje,
    getCamionesOptions,
    getAcopladosOptions,
    getChoferesOptions,
    getClientesOptions,
    type ViajePayload,
} from '../services/viaje.service';
import type {
    ApiResponse,
    Viaje,
    CamionOption,
    AcopladoOption,
    ChoferOption,
    ClienteOption,
} from '../types/models';
import '../styles/ui.css';
import '../styles/viajes.css';

const ESTADOS_BASE = ['pendiente', 'en_curso', 'finalizado', 'cancelado'];

export const ViajeDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === undefined;

    const [registro, setRegistro] = useState<Viaje | null>(null);
    const [isEditing, setIsEditing] = useState(isNew);

    // Catálogos para selects
    const [camiones, setCamiones] = useState<CamionOption[]>([]);
    const [acoplados, setAcoplados] = useState<AcopladoOption[]>([]);
    const [choferes, setChoferes] = useState<ChoferOption[]>([]);
    const [clientes, setClientes] = useState<ClienteOption[]>([]);

    // Campos del formulario
    const [fechaCargaInput, setFechaCargaInput] = useState('');
    const [remitoInput, setRemitoInput] = useState('');
    const [kgsInput, setKgsInput] = useState('');
    const [kmsInput, setKmsInput] = useState('0');
    const [destinoInput, setDestinoInput] = useState('');
    const [estadoInput, setEstadoInput] = useState('pendiente');
    const [camionInput, setCamionInput] = useState('');
    const [acopladoInput, setAcopladoInput] = useState('');
    const [choferInput, setChoferInput] = useState('');
    const [clienteInput, setClienteInput] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const activeEditing = isNew || isEditing;

    const poblarFormulario = (v: Viaje) => {
        setFechaCargaInput(v.fecha_carga.slice(0, 10));
        setRemitoInput(v.remito);
        setKgsInput(String(v.kgs));
        setKmsInput(String(v.kms_recorridos));
        setDestinoInput(v.destino);
        setEstadoInput(v.estado);
        setCamionInput(String(v.id_camion));
        if (v.id_acoplado !== null) {
            setAcopladoInput(String(v.id_acoplado));
        } else {
            setAcopladoInput('');
        }
        setChoferInput(String(v.id_chofer));
        setClienteInput(String(v.id_cliente));
    };

    useEffect(() => {
        const cargarTodo = async () => {
        try {
            setLoading(true);
            setError('');

            const [resCamiones, resAcoplados, resChoferes, resClientes] = await Promise.all([
                getCamionesOptions(),
                getAcopladosOptions(),
                getChoferesOptions(),
                getClientesOptions(),
            ]);

            setCamiones(resCamiones.data || []);
            setAcoplados(resAcoplados.data || []);
            setChoferes(resChoferes.data || []);
            setClientes(resClientes.data || []);

            if (!isNew) {
                const resViaje = await getViajeById(Number(id));
                setRegistro(resViaje.data);
                poblarFormulario(resViaje.data);
                setIsEditing(false);
            }
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('No se pudo cargar la información del viaje.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarTodo();
    }, [id, isNew]);

    const handleCancelEdit = () => {
        if (isNew) {
            navigate('/viajes');
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

        if (!fechaCargaInput.trim()) {
            setError('La fecha de carga es obligatoria.');
        return;
        }
        if (!remitoInput.trim()) {
            setError('El número de remito es obligatorio.');
        return;
        }
        if (!destinoInput.trim()) {
            setError('El destino es obligatorio.');
        return;
        }
        if (!camionInput || !choferInput || !clienteInput) {
            setError('Debés seleccionar camión, chofer y cliente.');
        return;
        }

        const kgsNum = Number(kgsInput);
        const kmsNum = Number(kmsInput);
        if (Number.isNaN(kgsNum) || kgsNum < 0) {
            setError('Los kilogramos deben ser un número válido mayor o igual a 0.');
            return;
        }
        if (Number.isNaN(kmsNum) || kmsNum < 0) {
            setError('Los kilómetros recorridos deben ser un número válido mayor o igual a 0.');
            return;
        }

        let idAcopladoParsed: number | null = null;
        if (acopladoInput !== '') {
            idAcopladoParsed = Number(acopladoInput);
        }

        const payload: ViajePayload = {
            fecha_carga: fechaCargaInput,
            remito: remitoInput.trim(),
            kgs: kgsNum,
            kms_recorridos: kmsNum,
            destino: destinoInput.trim(),
            estado: estadoInput,
            id_camion: Number(camionInput),
            id_acoplado: idAcopladoParsed,
            id_chofer: Number(choferInput),
            id_cliente: Number(clienteInput),
        };

        try {
            setSaving(true);
            if (isNew) {
                await createViaje(payload);
                navigate('/viajes');
                return;
            }

            const res = await updateViaje(Number(id), payload);
            setRegistro(res.data);
            poblarFormulario(res.data);
            setIsEditing(false);
            setSuccess(res.msg || 'Viaje actualizado correctamente.');
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('Error al guardar los datos del viaje.');
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
            `¿Seguro que querés eliminar el viaje remito "${registro.remito}"?`
            );
        if (!confirmado) {
            return;
        }

        try {
            setSaving(true);
            await deleteViaje(registro.id_viaje);
            navigate('/viajes');
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('No se pudo eliminar el viaje (verificá que no tenga incidencias asociadas).');
            }
            setSaving(false);
        }
    };

    const opcionesEstado = [...ESTADOS_BASE];
    if (estadoInput && !opcionesEstado.includes(estadoInput)) {
        opcionesEstado.push(estadoInput);
    }

    let breadcrumbText = 'OPERACIONES / VIAJES';
    let pageTitle = 'Detalle del viaje';
    let pageSubtitle = 'Información de carga, recorrido y recursos asignados.';
    let cardHeading = '';

    if (isNew) {
        breadcrumbText = 'VIAJES / NUEVO';
        pageTitle = 'Nuevo viaje';
        pageSubtitle = 'Completá los datos para registrar un traslado.';
        cardHeading = 'Datos del viaje';
    } else if (registro) {
        cardHeading = `Remito ${registro.remito}`;
    }

    let saveButtonLabel = 'Guardar cambios';
    if (isNew) {
        saveButtonLabel = 'Crear viaje';
    }
    if (saving) {
        saveButtonLabel = 'Guardando...';
    }

    return (
        <div className="page-container">
        <Link to="/viajes" className="back-link">
            <ArrowLeft size={15} />
            Volver a viajes
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
                    <label htmlFor="detail-id">ID Viaje</label>
                    <input
                    id="detail-id"
                    type="text"
                    className="input-field"
                    value={registro.id_viaje}
                    readOnly
                    />
                </div>
                )}

                <div className="form-field">
                <label htmlFor="detail-fecha">Fecha de carga</label>
                <input
                    id="detail-fecha"
                    type="date"
                    className="input-field"
                    value={fechaCargaInput}
                    onChange={(e) => setFechaCargaInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field">
                <label htmlFor="detail-remito">Remito</label>
                <input
                    id="detail-remito"
                    type="text"
                    className="input-field"
                    placeholder="Ej: REM-000124"
                    value={remitoInput}
                    onChange={(e) => setRemitoInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field">
                <label htmlFor="detail-destino">Destino</label>
                <input
                    id="detail-destino"
                    type="text"
                    className="input-field"
                    placeholder="Ej: Puerto Ingeniero White"
                    value={destinoInput}
                    onChange={(e) => setDestinoInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field">
                <label htmlFor="detail-kgs">Carga (kgs)</label>
                <input
                    id="detail-kgs"
                    type="number"
                    min="0"
                    step="any"
                    className="input-field"
                    placeholder="Ej: 28500"
                    value={kgsInput}
                    onChange={(e) => setKgsInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field">
                <label htmlFor="detail-kms">Kms recorridos</label>
                <input
                    id="detail-kms"
                    type="number"
                    min="0"
                    step="any"
                    className="input-field"
                    placeholder="Ej: 320"
                    value={kmsInput}
                    onChange={(e) => setKmsInput(e.target.value)}
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

                <div className="form-field">
                <label htmlFor="detail-cliente">Cliente</label>
                <select
                    id="detail-cliente"
                    className="select-field"
                    value={clienteInput}
                    onChange={(e) => setClienteInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    <option value="">Seleccioná un cliente...</option>
                    {clientes.map((cl) => (
                    <option key={cl.id_cliente} value={cl.id_cliente}>
                        {cl.razon_social} ({cl.cuit})
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-field">
                <label htmlFor="detail-camion">Camión</label>
                <select
                    id="detail-camion"
                    className="select-field"
                    value={camionInput}
                    onChange={(e) => setCamionInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    <option value="">Seleccioná un camión...</option>
                    {camiones.map((c) => (
                    <option key={c.id_camion} value={c.id_camion}>
                        {c.patente} - {c.marca} {c.modelo}
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-field">
                <label htmlFor="detail-acoplado">Acoplado (opcional)</label>
                <select
                    id="detail-acoplado"
                    className="select-field"
                    value={acopladoInput}
                    onChange={(e) => setAcopladoInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    <option value="">Sin acoplado</option>
                    {acoplados.map((a) => (
                    <option key={a.id_acoplado} value={a.id_acoplado}>
                        {a.patente} ({a.tipo})
                    </option>
                    ))}
                </select>
                </div>

                <div className="form-field">
                <label htmlFor="detail-chofer">Chofer</label>
                <select
                    id="detail-chofer"
                    className="select-field"
                    value={choferInput}
                    onChange={(e) => setChoferInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    <option value="">Seleccioná un chofer...</option>
                    {choferes.map((ch) => (
                    <option key={ch.id_chofer} value={ch.id_chofer}>
                        {ch.nombre_completo} (DNI {ch.dni})
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