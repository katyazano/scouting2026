import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Users, Home, BarChart3, TrendingUp, BarChart2, Settings, QrCode 
} from 'lucide-react';
import clsx from 'clsx';

// Importamos el modal que creaste
import { SettingsModal } from './modals/SettingsModal';

export const Layout = () => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Analysis', path: '/analysis', icon: BarChart2 }, 
    { label: 'Compare', path: '/compare', icon: BarChart3 },
    { label: 'Trends', path: '/trends', icon: TrendingUp },
    { label: 'Scanner', path: '/scanner', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar - Menú Lateral */}
      <aside className="w-20 lg:w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-sm z-20">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800 shrink-0">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="ml-3 font-bold text-lg hidden lg:block tracking-tight text-white">
            Stratos<span className="text-indigo-400">Scout</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-3 py-3 rounded-lg transition-all group relative",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full lg:hidden" />
                )}
                <Icon size={20} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
                <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom Section: Settings & Info */}
        <div className="p-2 lg:p-4 border-t border-slate-800 shrink-0">
            {/* Botón de Configuración */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group mb-2"
                title="Configuration"
            >
                <Settings size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span className="ml-3 font-medium hidden lg:block">Settings</span>
            </button>

            {/* Versión */}
            <div className="text-[10px] uppercase tracking-wider text-slate-600 text-center lg:text-left pt-2 font-bold">
                <span className="hidden lg:inline">Offline Mode • v2.0</span>
                <span className="lg:hidden">v2.0</span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 relative w-full">
        <div className="max-w-7xl mx-auto p-4 lg:p-8 min-h-full">
            <Outlet />
        </div>
      </main>

      {/* Renderizamos el Modal aquí, fuera del flujo visual pero dentro del contexto */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};