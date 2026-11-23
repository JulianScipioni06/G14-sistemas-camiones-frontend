import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { Home } from '../pages/home';

export const AppRouter = () => {
    return (
        <BrowserRouter>
        <Routes>
            {/* Rutas públicas (sin sidebar) - cada integrante descomenta/agrega la suya */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/registro" element={<Registro />} /> */}
            {/* <Route path="/recuperar-password" element={<RecuperarPassword />} /> */}

            {/* Rutas privadas (con Layout: Sidebar + Header + Footer) */}
            <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {/* <Route path="perfil" element={<Perfil />} /> */}
            {/* Acá cada integrante agregará las rutas de su entidad */}
            </Route>
        </Routes>
        </BrowserRouter>
    );
};