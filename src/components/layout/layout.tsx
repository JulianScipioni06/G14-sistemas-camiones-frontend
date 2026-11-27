import { Link, Outlet } from 'react-router-dom';
import { getStoredUser, logoutRequest } from '../../services/auth.service';
import './Layout.css';

export const Layout = () => {
  const currentUser = getStoredUser();

  let headerTitle = 'Panel de Gestión';
  if (currentUser) {
    headerTitle = `Panel de Gestión · ${currentUser.usuario}`;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Sistema Camiones</h2>
        <nav>
          <ul>
            <li><Link to="/">Inicio / Dashboard</Link></li>
            <li><Link to="/perfil">Mi Perfil</Link></li>
            <li><Link to="/usuarios">Usuarios</Link></li>
            <li><Link to="/viajes">Viajes</Link></li>
            <li><Link to="/incidencias">Incidencias</Link></li>
            <li><Link to="/camiones">Camiones</Link></li>
            <li><Link to="/choferes">Choferes</Link></li>
            {/* Acá cada integrante agregará el link a su entidad */}
          </ul>
        </nav>
      </aside>

      <div className="main-container">
        <header className="header">
          <span>{headerTitle}</span>
          <Link to="/login" onClick={logoutRequest}>
            Cerrar sesión
          </Link>
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