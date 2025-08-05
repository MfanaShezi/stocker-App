export interface stock{
    id?: number;
    name: string;
    symbol: string;
    description?: string;
    isETF?: boolean;

    exchange?: string; // e.g., NYSE, NASDAQ

    category?: string;
    sector?: string;
    region?: string;
    assetClass?: string;
    fundFamily?: string;
    expenseRatio?: number;
    totalAssets?: number;
    peRatio?: number;
    dividendYield?: number;
    sharePrice?: number;
    hasDividends?: boolean;
    marketCap?: number;
    totalDebt?: number;

    roe?: number; // Return on Equity
    roa?: number; // Return on Assets
    priceToBook?: number; // Price-to-Book Ratio
    bookValue?: number; // Book Value
    dividendRate?: number; // Dividend Rate
    changePercentage?: number; // Changed from ChangePercentage to changePercentage
    Volume?: number; // Trading volume
    fiftyTwoWeekHigh?: number; // 52-week high price
    fiftyTwoWeekLow?: number; // 52-week low price

    prices?: StockPrice[];
    // news?: StockNews[];
    // dividends?: StockDividend[];
}
export interface StockPrice {
    id: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}