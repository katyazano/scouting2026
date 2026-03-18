import { useState, useRef } from 'react';
import { X, RefreshCw, Wifi, CheckCircle2, AlertCircle, Trash2, Upload } from 'lucide-react';
import { setServerIP, fetchLiveCSV, getStoredIP, clearLocalData, loadDataIntoMemory } from '../../api/client'; 
import { useQueryClient } from '@tanstack/react-query';

// --- COMPONENTE INTERNO: ESTATUS DE CONEXIÓN ---
const ConnectionStatus = () => {
    const [ip, setIp] = useState(getStoredIP()); 
    const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");
    const [isLoading, setIsLoading] = useState(false);
    
    const queryClient = useQueryClient();

    const handleConnect = async () => {
        setIsLoading(true);
        setStatus("idle");
        
        // 1. Configurar IP
        setServerIP(ip); 
        
        // 2. Intentar descargar CSV
        const success = await fetchLiveCSV(); 
        
        setIsLoading(false);

        if (success) {
            setStatus("connected");
            queryClient.invalidateQueries(); 
        } else {
            setStatus("error");
        }
    };

    return (
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 mb-6 shadow-inner">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Wifi size={20} className="text-indigo-500"/> Conexión Central
            </h3>
            
            <p className="text-xs text-slate-400 mb-3">
                Ingresa la IP de la computadora que corre <code>server_lite.py</code>:
            </p>

            <div className="flex gap-2 mb-3">
                <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-700 w-full font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Ej: 192.168.1.50"
                />
                <button 
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center min-w-[50px]"
                >
                    {isLoading ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : (
                        <RefreshCw size={18} />
                    )}
                </button>
            </div>
            
            {status === "connected" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
                    <CheckCircle2 size={16} />
                    <span className="font-bold">Sincronizado correctamente</span>
                </div>
            )}
            
            {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
                    <AlertCircle size={16} />
                    <span>Error: No se encontró el servidor.</span>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL: EL MODAL ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- FUNCIÓN PARA LEER CSV OFFLINE ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        await loadDataIntoMemory(csvText);
        alert(`✅ Archivo "${file.name}" cargado exitosamente en la memoria.`);
        window.location.reload(); 
      } catch (error) {
        alert("❌ Error al procesar el archivo CSV.");
      }
    };

    reader.readAsText(file);
  };

  const handleReset = () => {
      if (confirm("¿ESTÁS SEGURO? \nEsto borrará todos los datos guardados en el navegador (pero NO borrará el CSV de la computadora central). \nLa página se recargará.")) {
          clearLocalData();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-0 overflow-hidden">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Configuración</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 bg-slate-900/50 max-h-[80vh] overflow-y-auto">
          {/* 1. SECCIÓN DE CONEXIÓN POR RED */}
          <ConnectionStatus /> 

          {/* 2. NUEVA SECCIÓN: CARGA MANUAL OFFLINE */}
          <div className="mb-8 pt-2">
              <h4 className="text-indigo-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <Upload size={16}/> Carga Manual (Offline Backup)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                  Sube un archivo <code>.csv</code> directamente desde tu dispositivo si perdiste conexión con el servidor central.
              </p>
              
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm py-3 rounded-lg transition-colors border border-slate-600 flex justify-center items-center gap-2"
              >
                  <Upload size={18} />
                  Seleccionar archivo .csv
              </button>
          </div>

          {/* 3. ZONA DE PELIGRO */}
          <div className="pt-6 border-t border-slate-800">
              <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <Trash2 size={16}/> Zona de Peligro
              </h4>
              <button 
                onClick={handleReset}
                className="w-full border border-red-900/50 text-red-400 hover:bg-red-900/20 text-sm py-3 rounded-lg transition-colors"
              >
                  Borrar Caché y Recargar
              </button>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Usa esto si los datos se ven corruptos o quieres limpiar la sesión.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};