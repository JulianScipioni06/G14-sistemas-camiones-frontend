import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Home } from '../pages/home';
import { Login } from '../pages/login';
import { ProtectedRoute } from './ProtectedRoute';

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
                {/* Acá cada integrante agregará las rutas de su entidad */}
            </Route>
            </Route>
        </Routes>
        </BrowserRouter>
    );
};