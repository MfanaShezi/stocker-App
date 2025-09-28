export interface SentimentResponse {
    ticker: string;
    sentiment: {
      sentiment: string;
      score: number;
      rawScore: number;
      confidence: number;
      articlesProcessed: number;
      totalArticles: number;
    };
    timestamp: string;
    status: string;
  }