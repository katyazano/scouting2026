// src/types/index.ts

// Interfaz para el endpoint /trend (Gráfica de línea)
export interface MatchTrend {
  match_num: number;
  match_total_pts: number;
  z_score: number;
  anomaly: boolean;
}

// Interfaz para el endpoint /overview (Datos generales)
export interface TeamOverview {
  team_num: number;
  matches_played: number;
  
  overall: {
    avg_total_pts: number;
  };

  auto: {
    avg_total_pts: number;
    success_rate: number;
  };

  teleop: {
    avg_fuel_pts: number;
    avg_total_pts: number;
    hang_success_rate: number;
    mode_climb_level: number;
  };

  advanced: {
    reliability: {
      currently_broken: boolean;
      broke: {
        occurred: boolean;
        matches: number[];
      };
    };
  };
}