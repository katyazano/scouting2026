import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useQueryClient } from '@tanstack/react-query';
import { addMatchesToMemory } from '../../api/client';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const ScannerPage = () => {
  const [scanResult, setScanResult] = useState<{success: boolean, msg: string} | null>(null);
  const queryClient = useQueryClient();
  
  // Para evitar lecturas múltiples muy rápidas
  const [lastScanTime, setLastScanTime] = useState(0);

  const handleScan = (text: string) => {
      const now = Date.now();
      if (now - lastScanTime < 2000) return; // Esperar 2 segundos entre escaneos
      
      if (text) {
          setLastScanTime(now);
          try {
            const matchData = JSON.parse(text);
            const payload = Array.isArray(matchData) ? matchData : [matchData];
            
            const result = addMatchesToMemory(payload);
            
            if (result.success) {
                setScanResult({ success: true, msg: `Agregados ${result.count} registros` });
                queryClient.invalidateQueries();
                
                // Limpiar mensaje de éxito después de 3 seg
                setTimeout(() => setScanResult(null), 3000);
            } else {
                setScanResult({ success: false, msg: "Datos duplicados o vacíos" });
            }

          } catch (err) {
            console.error(err);
            setScanResult({ success: false, msg: "QR no válido (No es JSON)" });
          }
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-950">
      <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        Scanner Station
      </h1>
      
      <div className="w-full max-w-sm aspect-square border-4 border-indigo-500 rounded-xl overflow-hidden shadow-2xl bg-black relative">
        <Scanner 
            onScan={(result) => {
                if (result && result.length > 0) {
                    handleScan(result[0].rawValue);
                }
            }}
            formats={['qr_code']} // Solo leer QRs para optimizar
            components={{
                onOff: true,  // Botón de encender/apagar cámara
            }}
        />
        
        {/* Overlay de Resultado */}
        {scanResult && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all animate-in fade-in zoom-in duration-300`}>
                {scanResult.success ? (
                    <CheckCircle2 className="text-emerald-500 h-16 w-16 mb-2" />
                ) : (
                    <AlertCircle className="text-red-500 h-16 w-16 mb-2" />
                )}
                <p className="text-white font-bold text-lg">{scanResult.msg}</p>
            </div>
        )}
      </div>

      <div className="mt-6 text-slate-400 text-center text-sm max-w-xs">
        Apunta a un código QR de scouting.<br/>
        El sistema procesará los datos automáticamente.
      </div>
    </div>
  );
};