export interface PortfolioResponse {
    purchases: Purchase[];
    totalInvested: number;
    totalPositions: number;
}

export interface Purchase {
    id: number;
    stockSymbol: string;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
    purchaseValue: number;
    companyName: string;
    // current price data
    currentPrice: number;
    currentPriceDate: string;
    currentValue: number;
    profitLoss: number;
    profitLossPercentage: number;
}

