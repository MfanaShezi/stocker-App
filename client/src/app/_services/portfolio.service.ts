import { inject, Injectable, signal } from '@angular/core';
import { StockService } from './stock.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { PortfolioResponse, Purchase } from '../_models/PortfolioResponse';
import { environment } from '../../environments/environment.development';

export interface PortfolioHolding {
  symbol: string;
  companyName: string;
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  purchases: Purchase[];
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalPositions: number;
}

export interface BuyStockRequest {
  symbol: string;
  quantity: number;
  purchaseDate?: string; // Optional for historical purchase
}


export interface BuyStockResponse {
  id: number;
  stockSymbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  purchaseValue: number;
  companyName: string;
  currentPrice: number;
  currentPriceDate: string;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;

}
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  stockservice = inject(StockService);
  private http=inject(HttpClient);
  baseUrl=environment.apiUrl;
  portfolioData=signal<PortfolioResponse | null>(null);
  userPurchases = signal<Purchase[]>([]);
  //cachedData=new Map();

  getPortfolioData(): Observable<PortfolioResponse> {
    return this.http.get<PortfolioResponse>(this.baseUrl + 'purchase/portfolio').pipe(
      tap(data => {
        // Update signals when data is loaded
        this.portfolioData.set(data);
        this.userPurchases.set(data.purchases || []);
      })
    );
  }
  getGroupedHoldings(): Observable<PortfolioHolding[]> {
    return this.getPortfolioData().pipe(
      map(data => {
        // Group purchases by symbol
        const grouped = data.purchases.reduce((acc, purchase) => {
          if (!acc[purchase.stockSymbol]) {
            acc[purchase.stockSymbol] = [];
          }
          acc[purchase.stockSymbol].push(purchase);
          return acc;
        }, {} as Record<string, Purchase[]>);

        // Create holdings from grouped purchases using backend calculations
        return Object.entries(grouped).map(([symbol, purchases]) => ({
          symbol,
          companyName: purchases[0].companyName,
          totalQuantity: purchases.reduce((sum, p) => sum + p.quantity, 0),
          averageBuyPrice: purchases.reduce((sum, p) => sum + p.purchaseValue, 0) / 
                          purchases.reduce((sum, p) => sum + p.quantity, 0),
          currentPrice: purchases[0].currentPrice, // Same for all purchases of same stock
          totalInvested: purchases.reduce((sum, p) => sum + p.purchaseValue, 0),
          currentValue: purchases.reduce((sum, p) => sum + p.currentValue, 0),
          profitLoss: purchases.reduce((sum, p) => sum + p.profitLoss, 0),
          profitLossPercentage: purchases.reduce((sum, p) => sum + p.purchaseValue, 0) > 0 ? 
            (purchases.reduce((sum, p) => sum + p.profitLoss, 0) / 
             purchases.reduce((sum, p) => sum + p.purchaseValue, 0)) * 100 : 0,
          purchases
        }));
      })
    );
  }

  getPortfolioSummary(): Observable<PortfolioSummary> {
    return this.getPortfolioData().pipe(
      map(data => ({
        totalInvested: data.totalInvested,
        currentValue: data.purchases.reduce((sum, p) => sum + p.currentValue, 0),
        totalProfitLoss: data.purchases.reduce((sum, p) => sum + p.profitLoss, 0),
        totalProfitLossPercentage: data.totalInvested > 0 ? 
          (data.purchases.reduce((sum, p) => sum + p.profitLoss, 0) / data.totalInvested) * 100 : 0,
        totalPositions: data.totalPositions
      }))
    );
  }

  //buy stock
  buyStock(request: BuyStockRequest): Observable<BuyStockResponse> {
    return this.http.post<BuyStockResponse>(`${this.baseUrl}purchase/buy`, request);
  }
  // sellStock(purchaseId: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}purchase/${purchaseId}`);
  // }

  sellStock(symbol: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}purchase/all/${symbol}`);
  }
  

  

  validatePurchase(request: BuyStockRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.symbol || request.symbol.trim() === '') {
      errors.push('Stock symbol is required');
    }

    if (!request.quantity || request.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (request.quantity && request.quantity > 10000) {
      errors.push('Maximum quantity is 10,000 shares');
    }

    if (request.purchaseDate) {
      const purchaseDate = new Date(request.purchaseDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - 147);
      const maxDate = new Date();

      if (purchaseDate < minDate || purchaseDate > maxDate) {
        errors.push(`Purchase date must be between ${minDate.toDateString()} and ${maxDate.toDateString()}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
  // Utility methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  hasStock(symbol: string): boolean {
    const purchases = this.userPurchases();
    return purchases.some(p => p.stockSymbol.toUpperCase() === symbol.toUpperCase());
  }

 // reInitialize portfolio data
 initializePortfolioData() {
  this.getPortfolioData().subscribe();
}

}

  
  