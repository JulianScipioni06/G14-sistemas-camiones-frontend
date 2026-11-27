import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Home } from '../pages/home';
import { Login } from '../pages/login';
import { Usuarios } from '../pages/usuarios';
import { UsuarioDetalle } from '../pages/usuarioDetalle';
import { ProtectedRoute } from './ProtectedRoute';
import { Viajes } from '../pages/viajes';
import { ViajeDetalle } from '../pages/viajeDetalle';

export const AppRouter = () => {
    return (
        <BrowserRouter>
        <Routes>
            {/* Rutas públicas (sin sidebar) */}
            <Route path="/login" element={<Login />} />

            {/* Rutas privadas (con Layout: Sidebar + Header + Footer) */}
            <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="usuarios/nuevo" element={<UsuarioDetalle />} />
                <Route path="usuarios/:id" element={<UsuarioDetalle />} />
                <Route path="viajes" element={<Viajes />} />
                <Route path="viajes/nuevo" element={<ViajeDetalle />} />
                <Route path="viajes/:id" element={<ViajeDetalle />} />
            </Route>
            </Route>
        </Routes>
        </BrowserRouter>
    );
};