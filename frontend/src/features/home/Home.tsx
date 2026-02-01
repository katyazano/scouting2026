import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="mb-8 p-4 bg-indigo-500/10 rounded-full ring-1 ring-indigo-500/30">
        <Search size={48} className="text-indigo-400" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
        Bienvenido a Stratos Scout
      </h1>
      
      <p className="text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
        Sistema de análisis de scouting para FRC. Selecciona una opción del menú o busca un equipo para comenzar.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/teams" 
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
        >
          Ver Equipos
        </Link>
        <Link 
          to="/compare" 
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors border border-slate-700"
        >
          Comparativa
        </Link>
      </div>
    </div>
  );
};