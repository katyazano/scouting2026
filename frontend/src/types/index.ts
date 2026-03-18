export interface MatchTrend {
  match_num: number;
  match_total_pts: number;
  z_score: number;
  anomaly: boolean;
}

export interface ScoutRecord {
  team_num: number;
  match_num: number;
  // ... tus otros campos ...
  
  // OPCIÓN A: Agrega los nuevos explícitamente
  extra_1?: number;
  extra_2?: number;
  extra_3?: number;
  extra_4?: boolean | number;
  extra_5?: number;

  // OPCIÓN B (Más fácil): Permite cualquier campo extra
  [key: string]: any; 
}

export interface ScouterComment {
  match_num: number;
  scouter: string;
  text: string;
}

export interface TeamOverview {
  team_num: number;
  matches_played: number;
  comments: ScouterComment[];
  
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
    latest: {
        chasis: string;
        climber: boolean;
        hopper_capacity: string; // Ahora es string ("61+")
        intake: string;
        shooter: {
            raw: string; // El texto combinado ("TURRET + HOOD")
            labels: string[];
        };
    };
    reliability: {
      currently_broken: boolean;
      broke: {
        occurred: boolean;
        matches: number[];
      };
      fixed: {
        matches: number[];
      };
    };
    typical: {
      role: string;
      trench: string;
    };
  };
}

export interface TeamSummary {
  team_num: number;
  nickname?: string;
}

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