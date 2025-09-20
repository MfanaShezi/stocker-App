import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StockService } from '../_services/stock.service';
import { stock } from '../_models/stock';

@Component({
  selector: 'app-screener',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './screener.component.html',
  styleUrls: ['./screener.component.css']
})
export class ScreenerComponent implements OnInit {
  private stockService = inject(StockService);
  private router = inject(Router);

  // Filter properties
  marketCapFilter = '';
  sector = '';
  volume = '';
  capitalEfficiency = '';
  priceChange = '';
  priceChangePercent = '';
  signalStatus = '';
  priceRangeMin: number | null = null;
  priceRangeMax: number | null = null;
  marketCap = 50;
  movingUp = false;
  movingDown = false;
  noChange = false;
  overlayIndicator = '';

  // Data properties
  allStocks: stock[] = [];
  filteredStocks: stock[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading = true;
    this.stockService.getAllStocks().subscribe({
      next: (stocks) => {
        this.allStocks = stocks || [];
        this.filteredStocks = [...this.allStocks];
        this.isLoading = false;
        console.log('Loaded stocks for screening:', this.allStocks.length);
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    console.log('Applying filters...');
    
    this.filteredStocks = this.allStocks.filter(stock => {
      // Market Cap Filter
      if (this.marketCapFilter) {
        const marketCap = stock.marketCap || 0;
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

      // Sector Filter
      if (this.sector && stock.sector) {
        if (stock.sector.toLowerCase() !== this.sector.toLowerCase()) {
          return false;
        }
      }

      // Volume Filter
      if (this.volume && stock.Volume) {
        const volume = stock.Volume;
        switch (this.volume) {
          case 'greaterThan1M':
            if (volume < 1000000) return false;
            break;
          case 'greaterThan5M':
            if (volume < 5000000) return false;
            break;
          case 'greaterThan10M':
            if (volume < 10000000) return false;
            break;
        }
      }

      // Price Range Filter
      if (this.priceRangeMin !== null && stock.sharePrice) {
        if (stock.sharePrice < this.priceRangeMin) return false;
      }
      if (this.priceRangeMax !== null && stock.sharePrice) {
        if (stock.sharePrice > this.priceRangeMax) return false;
      }

      // Price Change Percentage Filter
      if (this.priceChangePercent && stock.changePercentage !== null) {
        const changePercent = Math.abs(stock.changePercentage || 0);
        switch (this.priceChangePercent) {
          case '0-5':
            if (changePercent < 0 || changePercent > 5) return false;
            break;
          case '5-10':
            if (changePercent < 5 || changePercent > 10) return false;
            break;
          case '10-20':
            if (changePercent < 10 || changePercent > 20) return false;
            break;
          case '20+':
            if (changePercent < 20) return false;
            break;
        }
      }

      // Movement Direction Filter
      if (this.movingUp || this.movingDown || this.noChange) {
        const change = stock.changePercentage || 0;
        if (this.movingUp && change <= 0) return false;
        if (this.movingDown && change >= 0) return false;
        if (this.noChange && change !== 0) return false;
      }

      return true;
    });

    console.log('Filtered results:', this.filteredStocks.length);
  }

  resetFilters(): void {
    this.marketCapFilter = '';
    this.sector = '';
    this.volume = '';
    this.capitalEfficiency = '';
    this.priceChange = '';
    this.priceChangePercent = '';
    this.signalStatus = '';
    this.priceRangeMin = null;
    this.priceRangeMax = null;
    this.marketCap = 50;
    this.movingUp = false;
    this.movingDown = false;
    this.noChange = false;
    this.overlayIndicator = '';

    // Reset to show all stocks
    this.filteredStocks = [...this.allStocks];
    console.log('Filters reset');
  }

  viewStock(stockId: number): void {
    this.router.navigate(['/stocks', stockId]);
  }

  addToWatchlist(symbol: string): void {
    console.log('Adding to watchlist:', symbol);
    // Implement watchlist functionality
  }

  formatMarketCap(marketCap: number): string {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }

  getChangeClass(changePercent: number | null): string {
    if (!changePercent) return '';
    return changePercent >= 0 ? 'text-success' : 'text-danger';
  }

  getChangeIcon(changePercent: number | null): string {
    if (!changePercent) return 'fas fa-minus';
    return changePercent >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }
}