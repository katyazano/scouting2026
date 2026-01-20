// src/types/index.ts

// Interfaz para Gráficas (Trend)
export interface MatchTrend {
  match_num: number;
  match_total_pts: number;
  z_score: number;
  anomaly: boolean;
}

// Interfaz para Dashboard y Comparativa
export interface TeamOverview {
  team_num: number;
  nickname?: string;
  matches_played: number;
  
  overall: {
    avg_total_pts: number;
  };

  auto: {
    avg_total_pts: number;
    success_rate: number;
    avg_activation_rate?: number;     // Opcional
    auto_hang_success_rate?: number;  // Opcional
  };

  teleop: {
    avg_fuel_pts: number;
    avg_total_pts: number;
    hang_success_rate: number;
    mode_climb_level?: number;        // Opcional
  };

  advanced: {
    latest: {
        chasis: string;
        climber: boolean;
        hopper_capacity: string;
        intake: string;
        shooter: {
            raw: string;
        };
    };
    reliability: {
      currently_broken: boolean;
      broke: {
        occurred: boolean;
        matches: number[];
      };
    };
  };
}

// Interfaz para la Lista de Equipos
export interface TeamSummary {
  team_num: number;
  nickname?: string;
}

// Respuesta del endpoint /api/event/metrics/<key>
export interface EventMetricData {
  team_num: number;
  min: number;
  avg: number;
  max: number;
}

export interface EventMetricResponse {
  metric: string;
  data: EventMetricData[];
}