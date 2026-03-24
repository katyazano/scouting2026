import { X, AlertTriangle, Wrench, User } from 'lucide-react';

interface MatchDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
}

export const MatchDetailsModal = ({ isOpen, onClose, data }: MatchDetailsProps) => {
  if (!isOpen || !data) return null;

  // 1. Extraemos los datos de forma segura y directa desde el objeto plano
  // Si algo viene vacío, le ponemos un valor por defecto para evitar errores.
  const match_type = data.match_type || 'Match';
  const match_num = data.match_num || '?';
  const auto_pts = Number(data.auto_pts) || 0;
  const tele_pts = Number(data.tele_pts) || 0;
  // Calculamos el total por si la gráfica no lo envía explícitamente
  const total_pts = data.total_pts !== undefined ? Number(data.total_pts) : (auto_pts + tele_pts); 
  const scouter = data.scouter || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Evita cerrar si clickeas adentro
      >
        {/* Header */}
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {match_type} {match_num}
              {/* Usamos adv_broke que es el nombre real en tu CSV */}
              {data.adv_broke && (
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-1">
                  <AlertTriangle size={12}/> BROKE
                </span>
              )}
            </h3>
            <div className="text-slate-400 text-xs flex items-center gap-1 mt-1">
              <User size={12}/> Scouter: {scouter}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-xs uppercase">Auto</div>
              <div className="text-indigo-400 font-bold text-xl">{auto_pts}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-xs uppercase">Teleop</div>
              <div className="text-emerald-400 font-bold text-xl">{tele_pts}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 ring-1 ring-slate-700">
              <div className="text-slate-400 text-xs uppercase">Total</div>
              <div className="text-white font-bold text-xl">{total_pts}</div>
            </div>
          </div>

          {/* Comentarios (Lo más valioso) */}
          <div className="space-y-4">
            
            {data.auto_comm && (
              <div>
                <h4 className="text-indigo-300 text-xs font-bold uppercase mb-1">Auto comments</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 italic">
                  "{data.auto_comm}"
                </p>
              </div>
            )}

            {data.tele_comm && (
              <div>
                <h4 className="text-emerald-300 text-xs font-bold uppercase mb-1">Teleop comments</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 italic">
                  "{data.tele_comm}"
                </p>
              </div>
            )}

            {/* Usamos adv_comments que es el campo correcto de tus ajustes de CSV */}
            {data.adv_comments && (
              <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">General notes</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  {data.adv_comments}
                </p>
              </div>
            )}
            
            {/* Mensaje de fallback si no hay ningún comentario en el match */}
            {(!data.auto_comm && !data.tele_comm && !data.adv_comments) && (
              <p className="text-slate-500 text-sm italic text-center py-2">
                Sin comentarios registrados para este partido.
              </p>
            )}

          </div>
          
          {/* Flags Extras */}
          {/* Usamos adv_fixed que es el nombre real de tu estructura */}
          {data.adv_fixed && (
             <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-3 rounded-lg border border-green-900/50">
                <Wrench size={16}/> El robot se reparó durante este partido.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};