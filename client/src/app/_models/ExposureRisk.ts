export interface ExposureRisk {
    type: 'sector' | 'sector-region';
    category: string;
    percentage: number;
    count: number;
    riskLevel: 'low' | 'medium' | 'high';
    message: string;
  }
  