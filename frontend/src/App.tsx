import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// API Client (Importamos la nueva función blindada)
import { initializeBaseData } from './api/client';

// Componentes y Páginas
import { Layout } from './components/Layout';
import { Home } from './features/home/Home'; 
import { TeamPage } from './features/team/TeamPage'; 
import { TeamsList } from './features/team/TeamsList';
import { ComparePage } from './features/compare/ComparePage';
import { TrendsPage } from './features/trends/TrendsPage';
import { AnalysisPage } from './features/analysis/AnalysisPage';
import { ScannerPage } from './features/sync/ScannerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isDataReady, setIsDataReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Iniciando carga de datos (Online/Offline)...");
        
        // 1. Delegamos toda la lógica a nuestra función segura.
        // Si hay internet, lee el CSV. Si no hay internet, recupera del navegador en silencio.
        await initializeBaseData();
        
        console.log("Motor de análisis listo.");
        setIsDataReady(true);

      } catch (error: any) {
        console.error("Error crítico iniciando app:", error);
        setLoadingError(error.message);
        // Aun con error imprevisto, permitimos cargar la app para no dejar pantalla en negro
        setIsDataReady(true);
      }
    };

    initApp();
  }, []);

  // --- PANTALLA DE CARGA INICIAL ---
  if (!isDataReady) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Cargando Sistema de Análisis...</h2>
        <p className="text-slate-400 text-sm mt-2">Sincronizando base de datos...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            
            <Route path="teams" element={<TeamsList />} />
            <Route path="teams/:teamId" element={<TeamPage />} />
            
            <Route path="compare" element={<ComparePage />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            
            <Route path="scanner" element={<ScannerPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;