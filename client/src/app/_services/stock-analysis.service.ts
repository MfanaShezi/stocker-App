import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { StockService } from './stock.service';
import { stock } from '../_models/stock';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class StockAnalysisService {

  private accountService = inject(AccountService);
  private stockservice=inject(StockService) ;
  user: User | null = null;

  public suggestedStocks: stock[] = [];
  calculateStockScore(stock: any): number {
    let score = 0;
    
    // Core Financial Health (65 points)
    score += this.getROEScore(stock);
    score += this.getROAScore(stock);
    score += this.getDebtEquityScore(stock);
    score += this.getCurrentRatioScore(stock);
    score += this.getPositiveEquityScore(stock);
    
    // Valuation (27 points)
    score += this.getPriceToBookScore(stock);
    score += this.getEarningsYieldScore(stock);
    
    // Quality (8 points)
    score += this.getMarketCapScore(stock);
    
    // Industry adjustments
    score += this.getIndustryAdjustments(stock);
    
    return Math.min(Math.max(score, 0), 100);
  }

  getBuySignal(stock: any): string {
    const score = this.calculateStockScore(stock);
    
    if (score >= 85) return 'Strong Buy';
    if (score >= 70) return 'Buy';
    if (score >= 55) return 'Research';
    if (score >= 40) return 'Hold';
    return 'Avoid';
  }

  getBuySignalClass(stock: any): string {
    const signal = this.getBuySignal(stock);
    return signal.toLowerCase().replace(' ', '-');
  }

  getBuySignalIcon(stock: any): string {
    const signal = this.getBuySignal(stock);
    if (signal === 'Strong Buy' || signal === 'Buy') return 'fa-check-circle';
    if (signal === 'Research') return 'fa-exclamation-circle';
    return 'fa-times-circle';
  }

  getScoreBarClass(stock: any): string {
    const score = this.calculateStockScore(stock);
    
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 55) return 'score-fair';
    return 'score-poor';
  }

  // Core Financial Health Methods
  getROEScore(stock: any): number {
    const roe = stock.roe;
    if (!roe) return 0;
    
    if (roe >= 20) return 20;
    if (roe >= 15) return 18;
    if (roe >= 10) return 16;
    if (roe >= 5) return 14;
    if (roe < 5 ) return 10;
    return 0;
  }

  getROAScore(stock: any): number {
    const roa = stock.roa;
    if (!roa) return 0;
    
    if (roa >= 15) return 15;
    if (roa >= 8) return 10;
    if (roa >= 5) return 5;
    if (roa < 5 ) return 2;
    return 0;
  }

  getDebtEquityScore(stock: any): number {
    if (!stock.totalDebt || !stock.bookValue || stock.bookValue <= 0) return 0;
    
    const de = stock.totalDebt / stock.bookValue;
    
    if (de < 0.5) return 10;
    if (de < 1.0) return 8;
    if (de < 1.5) return 6;
    if(de >= 1.5) return 4;
    return 0;
  }

  getCurrentRatioScore(stock: any): number {
    if (!stock.totalAssets || !stock.totalDebt || stock.totalDebt <= 0) return 10;
    
    const cr = stock.totalAssets / stock.totalDebt;
    
    if (cr >= 2.0) return 10;
    if (cr >= 1.5) return 6;
    if (cr >= 1.0) return 2;
    if (cr < 1.0) return 1;
    return 10;
  }

  getPositiveEquityScore(stock: any): number {
    const equity = stock.bookValue;
    return (equity && equity > 0) ? 10 : 5;
  }

  // Valuation Methods
  getPriceToBookScore(stock: any): number {
    const pb = stock.priceToBook;
    if (!pb) return 0;
    
    // Industry-specific adjustments for technology
    if (this.isTechnologyStock(stock)) {
      if (pb < 3.0) return 14;
      if (pb < 6.0) return 9;
      if (pb < 8.0) return 4;
      if (pb > 8.0) return 2;
      return 0;
    }
    
    // Standard scoring
    if (pb < 1.0) return 14;
    if (pb < 2.0) return 12;
    if (pb < 3.0) return 10;
    if (pb > 3.0) return 8;
    return 0;
  }

  getEarningsYieldScore(stock: any): number {
    const pe = stock.peRatio;
    if (!pe || pe <= 0) return 0;
    
    const earningsYield = (1 / pe) * 100;
    
    if (earningsYield >= 10) return 13;
    if (earningsYield >= 7) return 9;
    if (earningsYield >= 5) return 5;
    return 0;
  }

  // Quality Methods
  getMarketCapScore(stock: any): number {
    const marketCap = stock.marketCap;
    if (!marketCap) return 0;
    
    if (marketCap >= 1000000000) return 8; // >= $1B
    if (marketCap >= 300000000) return 5;  // >= $300M
    return 0;
  }

  // Score Breakdown Methods
  getFinancialHealthScore(stock: any): number {
    return this.getROEScore(stock) + 
           this.getROAScore(stock) + 
           this.getDebtEquityScore(stock) + 
           this.getCurrentRatioScore(stock) + 
           this.getPositiveEquityScore(stock);
  }

  getValuationScore(stock: any): number {
    return this.getPriceToBookScore(stock) + this.getEarningsYieldScore(stock);
  }

  getQualityScore(stock: any): number {
    return this.getMarketCapScore(stock);
  }

  // Helper Methods
  getEarningsYield(stock: any): string {
    const pe = stock.peRatio;
    if (!pe || pe <= 0) return 'N/A';
    
    const earningsYield = (1 / pe) * 100;
    return earningsYield.toFixed(2);
  }

  getCurrentRatio(stock: any): string {
    if (!stock.totalAssets || !stock.totalDebt || stock.totalDebt <= 0) return 'N/A';
    
    const ratio = stock.totalAssets / stock.totalDebt;
    return ratio.toFixed(2);
  }

  getDebtEquityRatio(stock: any): string {
    if (!stock.totalDebt || !stock.bookValue || stock.bookValue <= 0) return 'N/A';
    
    const ratio = stock.totalDebt / stock.bookValue;
    return ratio.toFixed(2);
  }

  formatMarketCap(marketCap: number): string {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(0)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }

  // Industry Detection
  isTechnologyStock(stock: any): boolean {
    const sector = stock.sector?.toLowerCase();
    return sector?.includes('technology') || sector?.includes('software') || false;
  }

  getIndustryAdjustments(stock: any): number {
    // Add industry-specific bonuses here
    return 0;
  }
  //stock suggestions

  getStockSuggestions() {
    this.user = this.accountService.currentUser();
   

    var InvestmentStyle = this.getInvestmentStyleText(this.user?.investmentStyle);
    var RiskAppetite = this.getRiskAppetiteText(this.user?.riskAppetite); 
    console.log('Investment Style:', InvestmentStyle);
    console.log('Risk Appetite:', RiskAppetite);
    

    // Conservative or Low Risk preferences
    if(InvestmentStyle === 'Conservative' || RiskAppetite === 'Low') {
         for(let stock of this.stockservice.stocks() || []){
           console.log('analyzing this user');
          if(stock.marketCap! >= 10000000000 || stock.changePercentage! <= 2 )
          {
             this.suggestedStocks.push(stock);
          }
         }
      
    
    }
    else if(InvestmentStyle=== 'Aggressive' || RiskAppetite === 'High') {
      for(let stock of this.stockservice.stocks() || []){
        if( stock.changePercentage! >= 2 || stock.sector?.toLowerCase() === 'technology' )
        {
           this.suggestedStocks.push(stock);
        }
       }
    }
    else if(InvestmentStyle=== 'Balanced' || RiskAppetite === 'Medium') {
      for(let stock of this.stockservice.stocks() || []){
        console.log('analyzing this user');
        if((stock.marketCap! >= 2000000000 && stock.marketCap! < 10000000000) || (stock.changePercentage! >= 1 && stock.changePercentage! <= 3) )
        {
           this.suggestedStocks.push(stock);
        }
       }
    }

    const uniqueStocks = this.suggestedStocks.filter((stock, index, self) => 
      index === self.findIndex(s => s.id === stock.id)
    );
    return uniqueStocks;
    //return this.suggestedStocks;

  }

  getInvestmentStyleText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Conservative';
      case 2: return 'Aggressive';
      case 1: return 'Balanced';
      default: return 'Not specified';
    }
  }
  
  getRiskAppetiteText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Not specified';
    }
  }
  
  getInvestmentGoalText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Retirement';
      case 1: return 'Growth';
      case 2: return 'Income';
      default: return 'Not specified';
    }
  }
}
