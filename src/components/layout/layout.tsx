import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Sistema Camiones</h2>
        <nav>
          <ul>
            <li><Link to="/">Inicio / Dashboard</Link></li>
            <li><Link to="/perfil">Mi Perfil</Link></li>
            {/* Acá cada integrante agregará el link a su entidad */}
          </ul>
        </nav>
      </aside>

      <div className="main-container">
        <header className="header">
          <span>Panel de Gestión</span>
          <Link to="/login">Cerrar sesión</Link>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <p>G14 - Sistema de Gestión de Camiones © 2026</p>
        </footer>
      </div>
    </div>
  );
};