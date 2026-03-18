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

const saveToLocalStorage = () => {
    try {
        const json = JSON.stringify(IN_MEMORY_DB);
        localStorage.setItem(BACKUP_KEY, json);
    } catch (e) {
        console.error("Error guardando backup (Storage lleno?):", e);
    }
};

export const clearLocalData = () => {
    localStorage.removeItem(BACKUP_KEY);
    window.location.reload();
};

// ==========================================
// 3. CARGA INICIAL (Modo Offline-First)
// ==========================================

// NUEVA FUNCIÓN: Inicia la app blindada contra falta de internet
export const initializeBaseData = async () => {
    let csvText = "";
    
    try {
        // Intentamos cargar el CSV que subiste a Vercel
        const response = await fetch('/data/full_test_scouting_data.csv');
        if (!response.ok) throw new Error("No hay conexión o no existe el archivo");
        csvText = await response.text();
    } catch (error) {
        console.warn("⚠️ Arrancando en Modo Offline. Solo se usará la memoria local.");
        // Le damos un encabezado falso para que PapaParse no truene
        csvText = "timestamp,team_num,match_num\n"; 
    }

    // Pase lo que pase (haya CSV o no), procedemos a cargar
    await loadDataIntoMemory(csvText);
};

export const loadDataIntoMemory = async (csvText: string) => {
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // A. Datos del CSV estático (Base / Vercel)
        const csvData = processRawData(results.data);
        
        // B. Datos recuperados del LocalStorage (Nuevos/Escaneados)
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
        const mergedMap = new Map();
        
        csvData.forEach(d => mergedMap.set(`${d.match_num}-${d.team_num}`, d));
        localData.forEach(d => mergedMap.set(`${d.match_num}-${d.team_num}`, d));
        
        IN_MEMORY_DB = Array.from(mergedMap.values());
        
        saveToLocalStorage(); // Actualiza el backup con la fusión

        console.log(`✅ Base de datos lista: ${IN_MEMORY_DB.length} registros totales.`);
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
    "auto_pts",            // 9  
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

    const normalizedData = normalizeQrData(newMatchesInput);
    if (normalizedData.length === 0) return { success: false, message: "Formato incorrecto" };

    const hopperMapReverse: Record<string, number> = { '0-20': 0, '21-40': 1, '41-60': 2, '61+': 3 };
    
    const fixedData = normalizedData.map(d => {
        if (typeof d.adv_hoppercapacity === 'string' && hopperMapReverse[d.adv_hoppercapacity] !== undefined) {
            d.adv_hoppercapacity = hopperMapReverse[d.adv_hoppercapacity];
        }
        return d;
    });

    const cleanMatches = processRawData(fixedData);
    
    const uniqueNew = cleanMatches.filter(newItem => {
        if (!newItem.team_num || !newItem.match_num) return false;
        const exists = IN_MEMORY_DB.some(existing => 
            existing.match_num === newItem.match_num && 
            existing.team_num === newItem.team_num
        );
        return !exists;
    });

    if (uniqueNew.length === 0) return { success: false, message: "Datos duplicados" };

    IN_MEMORY_DB = [...IN_MEMORY_DB, ...uniqueNew];
    saveToLocalStorage(); 
    
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
        await loadDataIntoMemory(csvText);
        return true;
    } catch (e) {
        console.warn("⚠️ Bridge local no disponible. Usando datos previos en memoria.");
        // TRUCO OFFLINE: Si falla la conexión a la PC Central, al menos nos aseguramos
        // de que se cargue lo que haya en la memoria del navegador.
        await loadDataIntoMemory("timestamp,team_num,match_num\n");
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