import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Truck, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginRequest, isAuthenticated } from '../services/auth.service';
import type { ApiResponse } from '../types/models';
import '../styles/login.css';

export const Login = () => {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    let passwordInputType = 'password';
    if (showPassword) {
        passwordInputType = 'text';
    }

    let PasswordToggleIcon = Eye;
    if (showPassword) {
        PasswordToggleIcon = EyeOff;
    }

    let submitButtonText = 'Iniciar sesión';
    if (loading) {
        submitButtonText = 'Ingresando...';
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const usuarioTrimmed = usuario.trim();
        if (!usuarioTrimmed || !contrasena.trim()) {
        setError('Completá usuario y contraseña para continuar.');
        return;
        }

        try {
            setLoading(true);
            await loginRequest({
                usuario: usuarioTrimmed,
                contrasena,
            });
            navigate('/', { replace: true });
        } catch (err) {
            const axiosError = err as AxiosError<ApiResponse<null>>;
            if (axiosError.response?.data?.msg) {
                setError(axiosError.response.data.msg);
            } else {
                setError('No se pudo conectar con el servidor. Verificá que el backend esté activo.');
            }
            } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
        <div className="login-card">
            <div className="login-header">
            <div className="login-icon-badge">
                <Truck size={26} />
            </div>
            <h2>Sistema de Logística</h2>
            <p className="login-subtitle">Ingresá tus credenciales para acceder al panel</p>
        </div>

            {error && (
            <div className="login-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
                <label htmlFor="usuario">Usuario</label>
                <div className="login-input-wrapper">
                <User size={18} className="login-input-icon" />
                <input
                    id="usuario"
                    type="text"
                    className="login-input"
                    placeholder="Ej: jrodriguez"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                />
                </div>
            </div>

            <div className="login-field">
                <label htmlFor="contrasena">Contraseña</label>
                <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                    id="contrasena"
                    type={passwordInputType}
                    className="login-input"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                />
                <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Mostrar u ocultar contraseña"
                    tabIndex={-1}
                >
                    <PasswordToggleIcon size={18} />
                </button>
                </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
                {submitButtonText}
            </button>
            </form>
        </div>
        </div>
    );
};