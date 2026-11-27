import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { ArrowLeft, X } from 'lucide-react';
import {
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    type UpdateUsuarioPayload,
} from '../services/usuario.service';
import type { ApiResponse, Usuario } from '../types/models';
import '../styles/ui.css';
import '../styles/usuarios.css';

const ROLES_DISPONIBLES = ['admin', 'operador', 'chofer'];

export const UsuarioDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === undefined;

    const [registro, setRegistro] = useState<Usuario | null>(null);
    const [isEditing, setIsEditing] = useState(isNew);
    const [usuarioInput, setUsuarioInput] = useState('');
    const [contrasenaInput, setContrasenaInput] = useState('');
    const [rolInput, setRolInput] = useState('operador');

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const activeEditing = isNew || isEditing;
    const activeLoading = !isNew && loading;

    useEffect(() => {
        if (isNew) {
        return;
        }

        const cargarDetalle = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getUsuarioById(Number(id));
            setRegistro(res.data);
            setUsuarioInput(res.data.usuario);
            setRolInput(res.data.rol);
            setIsEditing(false);
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
            setError(axiosError.response.data.msg);
            } else {
            setError('No se pudo cargar el detalle del usuario.');
            }
        } finally {
            setLoading(false);
        }
        };

        void cargarDetalle();
    }, [id, isNew]);

    const handleCancelEdit = () => {
        if (isNew) {
        navigate('/usuarios');
        return;
        }

        if (registro) {
        setUsuarioInput(registro.usuario);
        setRolInput(registro.rol);
        }
        setContrasenaInput('');
        setError('');
        setIsEditing(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const usuarioTrimmed = usuarioInput.trim();
        if (!usuarioTrimmed) {
        setError('El nombre de usuario es obligatorio.');
        return;
        }

        if (isNew && !contrasenaInput.trim()) {
        setError('La contraseña es obligatoria para crear el usuario.');
        return;
        }

        try {
        setSaving(true);
        if (isNew) {
            await createUsuario({
            usuario: usuarioTrimmed,
            contrasena: contrasenaInput,
            rol: rolInput,
            });
            navigate('/usuarios');
            return;
        }

        const payload: UpdateUsuarioPayload = {
            usuario: usuarioTrimmed,
            rol: rolInput,
        };
        if (contrasenaInput.trim()) {
            payload.contrasena = contrasenaInput;
        }

        const res = await updateUsuario(Number(id), payload);
        setRegistro(res.data);
        setContrasenaInput('');
        setIsEditing(false);
        setSuccess(res.msg || 'Usuario actualizado correctamente.');
        } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        if (axiosError.response?.data?.msg) {
            setError(axiosError.response.data.msg);
        } else {
            setError('Error al guardar los cambios del usuario.');
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
        `¿Seguro que querés eliminar el usuario "${registro.usuario}"?`
        );
        if (!confirmado) {
        return;
        }

        try {
        setSaving(true);
        await deleteUsuario(registro.id_usuario);
        navigate('/usuarios');
        } catch (err) {
        const axiosError = err as AxiosError<ApiResponse<null>>;
        if (axiosError.response?.data?.msg) {
            setError(axiosError.response.data.msg);
        } else {
            setError('No se pudo eliminar el usuario (verificá que no tenga un chofer asociado).');
        }
        setSaving(false);
        }
    };

    let breadcrumbText = 'SISTEMA / USUARIOS';
    let pageTitle = 'Detalle del usuario';
    let pageSubtitle = 'Información de cuenta y rol asignado.';
    let cardHeading = '';

    if (isNew) {
        breadcrumbText = 'USUARIOS / NUEVO';
        pageTitle = 'Nuevo usuario';
        pageSubtitle = 'Completá los datos para registrar una nueva cuenta.';
        cardHeading = 'Datos de la cuenta';
    } else if (registro) {
        cardHeading = registro.usuario;
    }

    let passwordLabel = 'Contraseña';
    if (!isNew) {
        passwordLabel = 'Nueva contraseña (opcional)';
    }

    let saveButtonLabel = 'Guardar cambios';
    if (isNew) {
        saveButtonLabel = 'Crear usuario';
    }
    if (saving) {
        saveButtonLabel = 'Guardando...';
    }

    return (
        <div className="page-container">
        <Link to="/usuarios" className="back-link">
            <ArrowLeft size={15} />
            Volver a usuarios
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

        {activeLoading && <p>Cargando información del registro...</p>}

        {!activeLoading && (isNew || registro) && (
            <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="card-detail-header">
                <h3>{cardHeading}</h3>
            </div>

            <div className="form-grid">
                {!isNew && registro && (
                <div className="form-field">
                    <label htmlFor="detail-id">ID</label>
                    <input
                    id="detail-id"
                    type="text"
                    className="input-field"
                    value={registro.id_usuario}
                    readOnly
                    />
                </div>
                )}

                <div className="form-field">
                <label htmlFor="detail-usuario">Usuario</label>
                <input
                    id="detail-usuario"
                    type="text"
                    className="input-field"
                    placeholder="Ej: mfernandez"
                    value={usuarioInput}
                    onChange={(e) => setUsuarioInput(e.target.value)}
                    readOnly={!activeEditing}
                />
                </div>

                <div className="form-field">
                <label htmlFor="detail-rol">Rol</label>
                <select
                    id="detail-rol"
                    className="select-field"
                    value={rolInput}
                    onChange={(e) => setRolInput(e.target.value)}
                    disabled={!activeEditing}
                >
                    {ROLES_DISPONIBLES.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                    ))}
                </select>
                </div>

                {activeEditing && (
                <div className="form-field">
                    <label htmlFor="detail-contrasena">{passwordLabel}</label>
                    <input
                    id="detail-contrasena"
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={contrasenaInput}
                    onChange={(e) => setContrasenaInput(e.target.value)}
                    />
                </div>
                )}
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