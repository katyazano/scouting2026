import { X, AlertTriangle, Wrench, User } from 'lucide-react';

interface MatchDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // O define la interfaz MatchData si quieres ser estricto
}

export const MatchDetailsModal = ({ isOpen, onClose, data }: MatchDetailsProps) => {
  if (!isOpen || !data) return null;

  const { match_type, match_num,  auto_pts, details, tele_pts, total_pts } = data;

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
              {details.broke && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-1"><AlertTriangle size={12}/> BROKE</span>}
            </h3>
            <div className="text-slate-400 text-xs flex items-center gap-1 mt-1">
              <User size={12}/> Scouter: {details.scouter}
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
            {details.auto_comm && (
              <div>
                <h4 className="text-indigo-300 text-xs font-bold uppercase mb-1">Comentarios Auto</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 italic">
                  "{details.auto_comm}"
                </p>
              </div>
            )}

            {details.tele_comm && (
              <div>
                <h4 className="text-emerald-300 text-xs font-bold uppercase mb-1">Comentarios Teleop</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 italic">
                  "{details.tele_comm}"
                </p>
              </div>
            )}

            {details.notes && (
              <div>
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Notas Generales</h4>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  {details.notes}
                </p>
              </div>
            )}
          </div>
          
          {/* Flags Extras */}
          {details.fixed && (
             <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 p-2 rounded border border-green-900/50">
                <Wrench size={16}/> El robot fue reparado en este match.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};