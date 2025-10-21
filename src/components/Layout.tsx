import React, { ReactNode } from 'react';
import { ClipboardCheck, Users, Clock, BarChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { to: '/', icon: <BarChart className="w-5 h-5" />, label: 'Panel Principal' },
    { to: '/employees', icon: <Users className="w-5 h-5" />, label: 'Empleados' },
    { to: '/attendance', icon: <Clock className="w-5 h-5" />, label: 'Asistencia' },
    { to: '/reports', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Reportes' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header-gradient shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8" style={{ color: '#FFC907' }} />
              <span className="ml-2 text-xl font-bold text-white">Control de Asistencia</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav className="bg-white w-64 shadow-md hidden md:block">
          <div className="px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all ${
                        isActive
                          ? 'nav-active'
                          : 'hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className={({ isActive }) => isActive ? 'text-yellow-600' : ''}>
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Control de Asistencia. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;