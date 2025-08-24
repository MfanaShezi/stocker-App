import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-screener',
  standalone: true,
  imports: [FormsModule,DecimalPipe,CommonModule],
  templateUrl: './screener.component.html',
  styleUrl: './screener.component.css'
})
export class ScreenerComponent {
  router=inject(Router)
  sectorIndex = '';
  ovtlyrSignalReturn = '';
  capitalEfficiency = '';
  volume = '';
  signalStatus = '';
  priceChange = '';
  priceRange = '';
  marketCap = 50;
  priceRangeMin = '';
  priceRangeMax = '';
  fearGreed = 50;
  movingUp = false;
  movingDown = false;
  noChange = false;
  overlayIndicator = '';
  priceChangePercent='';
  marketCapFilter='';
  sector='';

  stocks: any[] = [
    {
      id: 1,
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      currentPrice: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: 58420000,
      marketCap: 2800000000000,
      sector: 'Technology',
      signal: 'BUY'
    },
    {
      id: 2,
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc.',
      currentPrice: 2875.12,
      change: -15.67,
      changePercent: -0.54,
      volume: 1240000,
      marketCap: 1900000000000,
      sector: 'Technology',
      signal: 'HOLD'
    },
    {
      id: 3,
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      currentPrice: 338.85,
      change: 5.23,
      changePercent: 1.57,
      volume: 28540000,
      marketCap: 2500000000000,
      sector: 'Technology',
      signal: 'BUY'
    },
    {
      id: 4,
      symbol: 'TSLA',
      companyName: 'Tesla, Inc.',
      currentPrice: 248.42,
      change: -8.96,
      changePercent: -3.48,
      volume: 45230000,
      marketCap: 789000000000,
      sector: 'Automotive',
      signal: 'SELL'
    },
    {
      id: 5,
      symbol: 'AMZN',
      companyName: 'Amazon.com, Inc.',
      currentPrice: 3380.50,
      change: 45.30,
      changePercent: 1.36,
      volume: 2840000,
      marketCap: 1700000000000,
      sector: 'E-commerce',
      signal: 'BUY'
    }
  ];


  filteredStocks = [...this.stocks];

  applyFilters(): void {
    // Apply your filtering logic here
    this.filteredStocks = this.stocks.filter(stock => {
      // Example filtering logic
      if (this.sector && stock.sector.toLowerCase() !== this.sector.toLowerCase()) {
        return false;
      }
      
      if (this.marketCapFilter) {
        const marketCap = stock.marketCap;
        switch (this.marketCapFilter) {
          case 'large':
            if (marketCap < 10000000000) return false;
            break;
          case 'mid':
            if (marketCap < 2000000000 || marketCap > 10000000000) return false;
            break;
          case 'small':
            if (marketCap > 2000000000) return false;
            break;
        }
      }
      
      return true;
    });
  }

  resetFilters() {
    this.sectorIndex = '';
    this.ovtlyrSignalReturn = '';
    this.capitalEfficiency = '';
    this.volume = '';
    this.signalStatus = '';
    this.priceChange = '';
    this.priceRange = '';
    this.marketCap = 50;
    this.priceRangeMin = '';
    this.priceRangeMax = '';
    this.fearGreed = 50;
    this.movingUp = false;
    this.movingDown = false;
    this.noChange = false;
    this.overlayIndicator = '';
    this.filteredStocks = [...this.stocks];
  }

  saveFilter() {
    console.log('Filter saved:', {
      sectorIndex: this.sectorIndex,
      ovtlyrSignalReturn: this.ovtlyrSignalReturn,
      capitalEfficiency: this.capitalEfficiency,
      volume: this.volume,
      signalStatus: this.signalStatus,
      priceChange: this.priceChange,
      priceRangeMin: this.priceRangeMin,
      priceRangeMax: this.priceRangeMax,
      movingUp: this.movingUp,
      movingDown: this.movingDown,
      noChange: this.noChange,
      overlayIndicator: this.overlayIndicator
    });
  }

  screen() {
    console.log('Screening with current filters');
  }

  viewStock(id: number): void {
    console.log('Navigating to stock:', id);
    // Navigate to stock detail page
    this.router.navigate(['/stocks', id], );
  }
}
