export interface Alert {
    id: number;
    stockId: number;
    stockSymbol: string;
    stockName: string;
    targetPrice: number;
    alertType: AlertType;
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
  }
  
  export interface CreateAlert {
    stockId: number;
    targetPrice: number;
    alertType: string;
  }
  
  export enum AlertType {
    PriceAbove = 'PriceAbove',
    PriceBelow = 'PriceBelow'
  }