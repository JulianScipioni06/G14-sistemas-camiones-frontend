import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Home } from '../pages/home';
import { Login } from '../pages/login';
import { Usuarios } from '../pages/usuarios';
import { UsuarioDetalle } from '../pages/usuarioDetalle';
import { ProtectedRoute } from './ProtectedRoute';
import { Viajes } from '../pages/viajes';
import { ViajeDetalle } from '../pages/viajeDetalle';
import { Incidencias } from '../pages/incidencias';
import { IncidenciaDetalle } from '../pages/incidenciaDetalle';
import { Ingresos } from '../pages/ingresos';
import { IngresoDetalle } from '../pages/ingresosDetalle';
import { Camiones } from '../pages/camiones';
import { CamionDetalle } from '../pages/camionDetalle';
import { Choferes } from '../pages/choferes';
import { ChoferDetalle } from '../pages/choferDetalle';
import { Clientes } from '../pages/clientes';
import { ClienteDetalle } from '../pages/clienteDetalle';

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
                <Route path="incidencias" element={<Incidencias />} />
                <Route path="incidencias/nuevo" element={<IncidenciaDetalle />} />
                <Route path="incidencias/:id" element={<IncidenciaDetalle />} />
                <Route path="ingresos" element={<Ingresos />} />
                <Route path="ingresos/nuevo" element={<IngresoDetalle />} />
                <Route path="ingresos/:id" element={<IngresoDetalle />} />
                <Route path="camiones" element={<Camiones />} />
                <Route path="camiones/nuevo" element={<CamionDetalle />} />
                <Route path="camiones/:id" element={<CamionDetalle />} />
                <Route path="choferes" element={<Choferes />} />
                <Route path="choferes/nuevo" element={<ChoferDetalle />} />
                <Route path="/choferes/:id" element={<ChoferDetalle />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/clientes/nuevo" element={<ClienteDetalle />} />
                <Route path="/clientes/:id" element={<ClienteDetalle />} />
            </Route>
            </Route>
        </Routes>
        </BrowserRouter>
    );
};