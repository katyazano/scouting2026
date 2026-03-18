import Papa from 'papaparse';
import { 
  processRawData, 
  calculateEventRanges, 
  calculateTeamOverview,
  calculateTeamTrend,
  ScoutRecord 
} from '../utils/analysisEngine';

// --- CONSTANTES Y LLAVES ---
const SERVER_IP_KEY = 'st_server_ip';
const BACKUP_KEY = 'st_matches_backup'; // Aquí se guardan los datos persistentes

// --- BASE DE DATOS EN MEMORIA ---
let IN_MEMORY_DB: ScoutRecord[] = [];

// ==========================================
// 1. CONFIGURACIÓN DE CONEXIÓN Y IP
// ==========================================

const getInitialUrl = () => {
  const storedIp = localStorage.getItem(SERVER_IP_KEY);
  const ip = storedIp || "localhost"; 
  return `http://${ip}:8000`;
};

let LOCAL_SERVER_URL = getInitialUrl();

export const getStoredIP = () => {
    return localStorage.getItem(SERVER_IP_KEY) || "localhost";
};

export const setServerIP = (ip: string) => {
    const cleanIp = ip.replace('http://', '').replace('https://', '').split(':')[0];
    localStorage.setItem(SERVER_IP_KEY, cleanIp);
    LOCAL_SERVER_URL = `http://${cleanIp}:8000`;
    console.log(`📡 IP configurada: ${cleanIp}`);
};

// ==========================================
// 2. PERSISTENCIA (LOCAL STORAGE)
// ==========================================

// Guardar el estado actual en el navegador
const saveToLocalStorage = () => {
    try {
        const json = JSON.stringify(IN_MEMORY_DB);
        localStorage.setItem(BACKUP_KEY, json);
    } catch (e) {
        console.error("Error guardando backup (Storage lleno?):", e);
    }
};

// Borrar datos (Reset de emergencia)
export const clearLocalData = () => {
    localStorage.removeItem(BACKUP_KEY);
    window.location.reload();
};

// ==========================================
// 3. CARGA INICIAL (CSV Base + Backup)
// ==========================================

export const loadDataIntoMemory = async (csvText: string) => {
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // A. Datos del CSV estático (Base / Vercel)
        const csvData = processRawData(results.data);
        
        // B. Datos recuperados del LocalStorage (Nuevos/Escaneados previamente)
        let localData: ScoutRecord[] = [];
        const backupJson = localStorage.getItem(BACKUP_KEY);
        
        if (backupJson) {
            try {
                const rawBackup = JSON.parse(backupJson);
                localData = processRawData(rawBackup);
                console.log(`♻️ Restaurados ${localData.length} matches del navegador.`);
            } catch (e) {
                console.error("Backup corrupto en navegador.", e);
            }
        }

        // C. MERGE INTELIGENTE (Prioridad al LocalStorage)
        // Usamos un Map combinando "match-team" para evitar duplicados
        const mergedMap = new Map();
        
        // 1. Cargamos base
        csvData.forEach(d => mergedMap.set(`${d.match_num}-${d.team_num}`, d));
        // 2. Sobrescribimos con datos locales (más recientes)
        localData.forEach(d => mergedMap.set(`${d.match_num}-${d.team_num}`, d));
        
        // 3. Actualizamos memoria
        IN_MEMORY_DB = Array.from(mergedMap.values());
        
        // 4. Actualizamos el backup con la fusión completa
        saveToLocalStorage();

        console.log(`✅ Base de datos lista: ${IN_MEMORY_DB.length} registros.`);
        resolve(true);
      }
    });
  });
};

// ==========================================
// 4. ESQUEMA QR Y PROCESAMIENTO
// ==========================================

const QR_SCHEMA = [
    "timestamp",           // 0
    "team_num",            // 1
    "match_num",           // 2
    "match_type",          // 3
    "alliance",            // 4
    "scouter",             // 5
    "start_zone",          // 6
    "auto_active",         // 7
    "auto_hang",           // 8
    "auto_pts",            // 9  <-- POSICIÓN CORRECTA AHORA
    "auto_comm",           // 10
    "tele_pts",            // 11
    "tele_comm",           // 12
    "tele_hang",           // 13
    "adv_role",            // 14
    "adv_broke",           // 15
    "adv_fixed",           // 16
    "adv_chasis",          // 17
    "adv_intake",          // 18
    "adv_shooter",         // 19
    "adv_climber",         // 20
    "adv_hoppercapacity",  // 21
    "adv_trench",          // 22
    "adv_comments"         // 23
];

const normalizeQrData = (rawData: any) => {
    if (typeof rawData === 'object' && !Array.isArray(rawData) && rawData !== null) return [rawData];
    if (Array.isArray(rawData) && Array.isArray(rawData[0])) return rawData.map(row => arrayToObject(row));
    if (Array.isArray(rawData)) return [arrayToObject(rawData)];
    return [];
};

const arrayToObject = (row: any[]) => {
    const obj: any = {};
    QR_SCHEMA.forEach((key, index) => {
        obj[key] = row[index];
    });
    return obj;
};

// ==========================================
// 5. AGREGAR DATOS (Scan / Upload)
// ==========================================

export const addMatchesToMemory = (newMatchesInput: any) => {
    console.log("📥 Recibiendo datos:", newMatchesInput);

    // 1. Normalizar
    const normalizedData = normalizeQrData(newMatchesInput);
    if (normalizedData.length === 0) return { success: false, message: "Formato incorrecto" };

    // 2. Parches de Datos (Fixes)
    const hopperMapReverse: Record<string, number> = { '0-20': 0, '21-40': 1, '41-60': 2, '61+': 3 };
    
    const fixedData = normalizedData.map(d => {
        // Fix Hopper String -> Int
        if (typeof d.adv_hoppercapacity === 'string' && hopperMapReverse[d.adv_hoppercapacity] !== undefined) {
            d.adv_hoppercapacity = hopperMapReverse[d.adv_hoppercapacity];
        }
        return d;
    });

    // 3. Procesar Tipos
    const cleanMatches = processRawData(fixedData);
    
    // 4. Filtrar Duplicados
    const uniqueNew = cleanMatches.filter(newItem => {
        if (!newItem.team_num || !newItem.match_num) return false;
        const exists = IN_MEMORY_DB.some(existing => 
            existing.match_num === newItem.match_num && 
            existing.team_num === newItem.team_num
        );
        return !exists;
    });

    if (uniqueNew.length === 0) return { success: false, message: "Datos duplicados" };

    // 5. ACTUALIZAR MEMORIA Y DISCO
    IN_MEMORY_DB = [...IN_MEMORY_DB, ...uniqueNew];
    saveToLocalStorage(); // <--- ESTO ASEGURA QUE PERSISTAN AL RECARGAR
    
    // 6. Intentar sincronizar con Bridge Local
    syncMatchesToLocalServer(uniqueNew);

    console.log(`✅ Agregados ${uniqueNew.length} registros.`);
    return { success: true, count: uniqueNew.length };
};

// ==========================================
// 6. BRIDGE SYNC & GETTERS
// ==========================================

export const fetchLiveCSV = async () => {
    try {
        console.log(`Sincronizando con ${LOCAL_SERVER_URL}...`);
        const response = await fetch(`${LOCAL_SERVER_URL}/api/csv`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) throw new Error("Error en servidor local");
        
        const csvText = await response.text();
        await loadDataIntoMemory(csvText); // Esto también actualizará el localStorage
        return true;
    } catch (e) {
        console.warn("Bridge local no disponible:", e);
        return false;
    }
};

export const syncMatchesToLocalServer = async (matches: any[]) => {
    try {
        await fetch(`${LOCAL_SERVER_URL}/api/scout/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matches)
        });
    } catch (e) {
        console.warn("No se pudo enviar al Bridge (¿No conectado?):", e);
    }
};

// --- DATA GETTERS PARA LA UI ---

export const getTeamsList = async (): Promise<TeamSummary[]> => {
  const uniqueTeams = Array.from(new Set(IN_MEMORY_DB.map(d => d.team_num))).sort((a, b) => a - b);
  return uniqueTeams.map(teamNum => {
      const overview = calculateTeamOverview(IN_MEMORY_DB, teamNum);
      return {
          team_num: teamNum,
          matches_played: overview?.matches_played || 0,
          avg_total_pts: overview?.overall.avg_total_pts || 0,
          nickname: `Team ${teamNum}`
      };
  });
};

export const getTeamOverview = async (teamNum: number | string) => {
  return calculateTeamOverview(IN_MEMORY_DB, Number(teamNum));
};

export const getTeamTrend = async (teamNum: number | string) => {
  return calculateTeamTrend(IN_MEMORY_DB, Number(teamNum));
};

export const getEventMetric = async (metricKey: string) => {
  const data = calculateEventRanges(IN_MEMORY_DB, metricKey);
  return { data }; 
};

// Interface auxiliar
export interface TeamSummary {
  team_num: number;
  nickname?: string;
  matches_played?: number;
  avg_total_pts?: number;
}