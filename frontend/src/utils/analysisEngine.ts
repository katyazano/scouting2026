import { mean, standardDeviation, min, max, mode } from 'simple-statistics';
import _ from 'lodash';

// --- 1. DEFINICIONES Y MAPAS (Igual que en tu Python) ---

export const CHASSIS_MAP: Record<number, string> = { 0: "TANK", 1: "SWERVE", 2: "MECANUM", 3: "CUSTOM" };
export const INTAKE_MAP: Record<number, string> = { 0: "OVER BUMPER", 1: "UNDER BUMPER", 2: "NONE" };
export const HOPPER_MAP: Record<number, string> = { 0: "0-20", 1: "21-40", 2: "41-60", 3: "61+" };
export const ROLE_MAP: Record<number, string> = { 0: "SCORER", 1: "FEEDER", 2: "DEFENSE", 3: "NONE" };
export const TRENCH_MAP: Record<number, string> = { 0: "TRENCH", 1: "BUMP", 2: "BOTH", 3: "NONE" };
export const SHOOTER_MAP: Record<number, string> = { 0: "TURRET", 1: "HOOD", 2: "DUAL", 3: "FIXED" };

// Interfaz que representa UNA fila del CSV procesada
export interface ScoutRecord {
  team_num: number;
  match_num: number;
  match_type: string;
  scouter: string;
  
  // Métricas Base
  auto_pts: number;
  tele_pts: number;
  auto_hang: number;
  tele_hang: number;
  auto_active: number;
  
  // Advanced / Booleanos (0 o 1)
  adv_broke: number;
  adv_fixed: number;
  adv_climber: number;
  adv_role: number;
  adv_trench: number;
  adv_chasis: number;
  adv_intake: number;
  adv_hoppercapacity: number; // A veces viene como string, lo parseamos a number si es ID
  
  // Listas o Strings
  adv_shooter: number[]; // Array de IDs
  auto_comm: string;
  tele_comm: string;
  adv_comments: string;
  
  // --- CAMPOS CALCULADOS (Logic de Negocio) ---
  auto_total_pts: number;
  tele_total_pts: number;
  match_total_pts: number;
  tele_hang_success: boolean;
  type_rank: number; // 0=Practice, 1=Qual, 2=Playoff
}

// Helper para obtener valor de mapas
const getMappedValue = (val: number | undefined, map: Record<number, string>, defaultVal = "N/A") => {
  if (val === undefined || val === null) return defaultVal;
  return map[val] || defaultVal;
};

// Helper para parsear listas que vienen como strings "1-2" o números
const parseListField = (val: any): number[] => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'number') return [val];
    if (typeof val === 'string') {
        if (val.includes('-')) return val.split('-').map(Number).filter(n => !isNaN(n));
        return [Number(val)];
    }
    return [];
};


// --- 2. PROCESAMIENTO INICIAL (Equivalente a load_csv) ---

export const processRawData = (data: any[]): ScoutRecord[] => {
  return data.map((row: any) => {
    // Conversiones seguras a números
    const safeNum = (v: any) => (v === "" || v === null || isNaN(Number(v))) ? 0 : Number(v);
    
    // Cálculos de Puntos (Fórmulas de event.py)
    const auto_pts = safeNum(row.auto_pts);
    const auto_hang = safeNum(row.auto_hang);
    const tele_pts = safeNum(row.tele_pts);
    const tele_hang = safeNum(row.tele_hang);
    
    const auto_total_pts = auto_pts + (auto_hang * 15);
    const tele_total_pts = tele_pts + (tele_hang * 10);
    const match_total_pts = auto_total_pts + tele_total_pts;

    // Determinar Rango del Match
    let type_rank = 1; // Default Qualification
    const mType = String(row.match_type || "").trim();
    if (mType === "Practice") type_rank = 0;
    if (mType === "Playoff") type_rank = 2;

    return {
      ...row,
      team_num: safeNum(row.team_num),
      match_num: safeNum(row.match_num),
      match_type: mType,
      scouter: String(row.scouter || "Anon"),
      
      auto_pts,
      tele_pts,
      auto_hang,
      tele_hang,
      auto_active: safeNum(row.auto_active),
      
      adv_broke: safeNum(row.adv_broke),
      adv_fixed: safeNum(row.adv_fixed),
      adv_climber: safeNum(row.adv_climber),
      adv_role: safeNum(row.adv_role),
      adv_trench: safeNum(row.adv_trench),
      adv_chasis: safeNum(row.adv_chasis),
      adv_intake: safeNum(row.adv_intake),
      adv_hoppercapacity: safeNum(row.adv_hoppercapacity),
      
      adv_shooter: parseListField(row.adv_shooter),
      
      auto_comm: String(row.auto_comm || ""),
      tele_comm: String(row.tele_comm || ""),
      adv_comments: String(row.adv_comments || ""),

      // Campos Calculados
      auto_total_pts,
      tele_total_pts,
      match_total_pts,
      tele_hang_success: tele_hang > 0,
      type_rank
    } as ScoutRecord;
  }).sort((a, b) => {
      // Ordenar por Tipo (Prac->Qual->Play) y luego por Match Num
      if (a.type_rank !== b.type_rank) return a.type_rank - b.type_rank;
      return a.match_num - b.match_num;
  });
};


// --- 3. CÁLCULO DE TENDENCIAS Y ANOMALÍAS (Equivalente a team_trend) ---

export const calculateTeamTrend = (allData: ScoutRecord[], teamNum: number) => {
  const teamData = allData.filter(d => d.team_num === teamNum);
  if (teamData.length === 0) return [];

  const points = teamData.map(d => d.match_total_pts);
  
  // Evitar crash si todos son 0 o 1 dato
  const avg = points.length > 0 ? mean(points) : 0;
  const standardDev = points.length > 1 ? standardDeviation(points) : 1; 

  return teamData.map(d => {
    const pts = d.match_total_pts;
    // Si la desviación es 0, el zScore es 0
    const zScore = standardDev === 0 ? 0 : (pts - avg) / standardDev;
    
    return {
      match_num: d.match_num,
      match_total_pts: pts,
      z_score: Number(zScore.toFixed(2)),
      anomaly: Math.abs(zScore) > 1.5 // Marca anomalía si se desvía más de 1.5 sigmas
    };
  });
};


// --- 4. RANGOS DEL EVENTO (Equivalente a event_ranges) ---

export const calculateEventRanges = (allData: ScoutRecord[], metricKey: string) => {
  const grouped = _.groupBy(allData, 'team_num');
  const results = [];

  for (const teamNumStr in grouped) {
    const teamNum = Number(teamNumStr);
    const matches = grouped[teamNumStr];
    let values: number[] = [];

    // Mapeo exacto a tu Python logic
    if (metricKey === 'match_avg_total_pts') values = matches.map(m => m.match_total_pts);
    else if (metricKey === 'auto_total_pts') values = matches.map(m => m.auto_total_pts);
    else if (metricKey === 'tele_total_pts') values = matches.map(m => m.tele_total_pts);
    else if (metricKey === 'tele_avg_fuel') values = matches.map(m => m.tele_pts); // Fuel points base
    else if (metricKey === 'auto_success_rate') values = matches.map(m => m.auto_active);
    else if (metricKey === 'tele_hang_success_rate') values = matches.map(m => m.tele_hang_success ? 1 : 0);
    else if (metricKey === 'break_rate') values = matches.map(m => m.adv_broke);
    // Modo especial
    else if (metricKey === 'tele_mode_hang') {
        const hangs = matches.map(m => m.tele_hang);
        // simple-statistics mode devuelve un numero, si hay empate devuelve el primero
        const modeVal = hangs.length > 0 ? mode(hangs) : 0;
        // En este caso especial retornamos estructura diferente si se requiere, 
        // pero para mantener consistencia con AnalysisTable, usaremos avg como mode
        values = [modeVal]; 
    }

    if (values.length === 0) continue;

    results.push({
      team_num: teamNum,
      min: min(values),
      avg: mean(values),
      max: max(values)
    });
  }

  // Ordenar descendente por promedio (avg)
  return results.sort((a, b) => b.avg - a.avg);
};


// --- 5. RESUMEN DETALLADO DE EQUIPO (Equivalente a team_overview) ---

export const calculateTeamOverview = (allData: ScoutRecord[], teamNum: number) => {
  // Filtramos y aseguramos orden correcto
  const teamData = allData
    .filter(d => d.team_num === teamNum)
    .sort((a, b) => {
        if (a.type_rank !== b.type_rank) return a.type_rank - b.type_rank;
        return a.match_num - b.match_num;
    });

  if (teamData.length === 0) return null;

  const latest = teamData[teamData.length - 1]; // Último match jugado

  // Helpers estadísticos
  const getAvg = (extractor: (d: ScoutRecord) => number) => {
      const vals = teamData.map(extractor);
      return vals.length ? Number(mean(vals).toFixed(2)) : 0;
  };

  // Cálculo de Moda para Climb
  const climbLevels = teamData.map(d => d.tele_hang);
  const modeClimb = climbLevels.length > 0 ? mode(climbLevels) : 0;

  // Lógica de Reliability (Broke/Fixed)
  const brokenMatches = teamData.filter(d => d.adv_broke === 1).map(d => d.match_num);
  const fixedMatches = teamData.filter(d => d.adv_fixed === 1).map(d => d.match_num);
  const isBrokenNow = (latest.adv_broke === 1 && latest.adv_fixed !== 1);

  // Mapeo de Shooters (List -> Labels)
  const shooterLabels = (latest.adv_shooter || [])
    .map(id => SHOOTER_MAP[id] || "UNKNOWN")
    .filter(Boolean);

  // Agregación de Comentarios
  const comments = teamData
    .map(d => {
        const parts = [];
        if (d.auto_comm && d.auto_comm !== "nan") parts.push(`[Auto] ${d.auto_comm}`);
        if (d.tele_comm && d.tele_comm !== "nan") parts.push(`[Tele] ${d.tele_comm}`);
        if (d.adv_comments && d.adv_comments !== "nan") parts.push(d.adv_comments);
        
        if (parts.length === 0) return null;
        
        return {
            match_num: d.match_num,
            scouter: d.scouter,
            text: parts.join(" | ")
        };
    })
    .filter(Boolean)
    .reverse(); // Más recientes primero

  // Estructura Final (Debe coincidir con TeamOverview interface)
  return {
    team_num: teamNum,
    matches_played: teamData.length,
    comments: comments,
    
    // Historial completo para gráficas
    trend: teamData.map(d => ({
        match_num: d.match_num,
        match_type: d.match_type === "Qualification" ? "Quals" : d.match_type,
        auto_pts: d.auto_pts,
        tele_pts: d.tele_pts,
        total_pts: d.match_total_pts,
        details: {
            scouter: d.scouter,
            broke: d.adv_broke === 1,
            fixed: d.adv_fixed === 1,
            climb_level: d.tele_hang
        }
    })),

    overall: {
        avg_total_pts: getAvg(d => d.match_total_pts),
        max_total_pts: max(teamData.map(d => d.match_total_pts))
    },
    auto: {
        avg_total_pts: getAvg(d => d.auto_total_pts),
        success_rate: getAvg(d => d.auto_active) // Ya es 0 o 1, el promedio es el %
    },
    teleop: {
        avg_total_pts: getAvg(d => d.tele_total_pts),
        avg_fuel_pts: getAvg(d => d.tele_pts),
        hang_success_rate: getAvg(d => d.tele_hang_success ? 1 : 0),
        mode_climb_level: typeof modeClimb === 'number' ? modeClimb : 0
    },
    advanced: {
        latest: {
            chasis: getMappedValue(latest.adv_chasis, CHASSIS_MAP),
            intake: getMappedValue(latest.adv_intake, INTAKE_MAP),
            hopper_capacity: getMappedValue(latest.adv_hoppercapacity, HOPPER_MAP),
            climber: latest.adv_climber === 1,
            shooter: {
                labels: shooterLabels,
                raw: shooterLabels.length > 0 ? shooterLabels.join(" + ") : "NONE"
            }
        },
        reliability: {
            currently_broken: isBrokenNow,
            broke: {
                occurred: brokenMatches.length > 0,
                matches: brokenMatches,
                last_match: brokenMatches.length > 0 ? brokenMatches[brokenMatches.length - 1] : null
            },
            fixed: {
                matches: fixedMatches,
                last_match: fixedMatches.length > 0 ? fixedMatches[fixedMatches.length - 1] : null
            }
        },
        typical: {
            role: getMappedValue(latest.adv_role, ROLE_MAP),
            trench: getMappedValue(latest.adv_trench, TRENCH_MAP)
        }
    }
  };
};