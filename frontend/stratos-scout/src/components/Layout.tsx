import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Home, BarChart3, TrendingUp, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Inicio', path: '/', icon: Home },
    { label: 'Equipos', path: '/teams', icon: Users },
    { label: 'Análisis', path: '/analysis', icon: BarChart2 }, 
    { label: 'Comparar', path: '/compare', icon: BarChart3 },
    { label: 'Tendencias', path: '/trends', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar - Menú Lateral */}
      <aside className="w-20 lg:w-64 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="ml-3 font-bold text-lg hidden lg:block tracking-tight">
            Stratos<span className="text-indigo-400">Scout</span>
          </span>
        </div>

        <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-3 py-3 rounded-lg transition-all group",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon size={20} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
                <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center lg:text-left">
            <span className="hidden lg:inline">LAN Mode • v1.0</span>
        </div>
      </aside>

      {/* Main Content - Aquí se renderizan las páginas */}
      <main className="flex-1 overflow-auto bg-slate-950 relative">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};