export interface SentimentResponse {
    ticker: string;
    Results: {
      sentiment: string;
      positiveArticles: number;
      negativeArticles: number;
      neutralArticles: number;
      articlesProcessed: number;
      totalArticles: number;
    };
    timestamp: string;
    status: string;
  }