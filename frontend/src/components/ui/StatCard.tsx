import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  // Colores semánticos: accent (azul/principal), danger (rojo/alerta), success (verde)
  variant?: 'default' | 'accent' | 'danger' | 'success'; 
}

export const StatCard = ({ label, value, subtext, variant = 'default' }: StatCardProps) => {
  return (
    <div className={clsx(
      "p-4 rounded-xl border flex flex-col items-start transition-all",
      // Estilos según la variante
      variant === 'default' && "bg-slate-800 border-slate-700 text-slate-100",
      variant === 'accent' && "bg-indigo-900/20 border-indigo-500/50 text-indigo-100",
      variant === 'danger' && "bg-red-900/20 border-red-500/50 text-red-100",
      variant === 'success' && "bg-emerald-900/20 border-emerald-500/50 text-emerald-100"
    )}>
      <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
        {label}
      </span>
      <div className="text-3xl font-mono font-bold tracking-tight">
        {value}
      </div>
      {subtext && (
        <span className="text-xs opacity-60 mt-2 font-medium">
          {subtext}
        </span>
      )}
    </div>
  );
};