export interface User{
    Id:number;
    username:string;
    email:string;
    token:string;
    investmentGoal:InvestmentGoal;
    investmentStyle:InvestmentStyle;
    riskAppetite:RiskAppetite;
    InvestmentTimeHorizon?: number;
    InvestmentBudget?: number;
    SentimentScore?: number;
 
}

export enum InvestmentStyle {
    Conservative = 'Conservative',
    Balanced = 'Balanced',
    Aggressive = 'Aggressive'
}

export enum RiskAppetite {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export enum InvestmentGoal {
    Retirement = 'Retirement',
    Growth = 'Growth',
    Income = 'Income'
}