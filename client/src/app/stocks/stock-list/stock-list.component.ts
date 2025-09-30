import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stock } from '../../_models/stock';
import { StockService } from '../../_services/stock.service';
import { RouterLink } from '@angular/router';
import { StockAnalysisService } from '../../_services/stock-analysis.service';
import { ToastrService } from 'ngx-toastr';
import { BuyStockRequest, PortfolioService } from '../../_services/portfolio.service';
import { FormsModule } from '@angular/forms';

type FilterType = 'all' | 'trending' | 'gainers' | 'losers' | 'volume' | 'tech' | 'healthcare' | 'finance'  | 'Suggested';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent implements OnInit {
  allStocks: stock[] = [];
  filteredStocks: stock[] = [];
  activeFilter: FilterType = 'all';
  isLoading = false;
  private toastr = inject(ToastrService);
  private portfolioService = inject(PortfolioService);
  
  stockservice = inject(StockService);
  public stockanalysis=inject(StockAnalysisService);

  filters: FilterType[] = ['all', 'trending', 'gainers', 'losers','Suggested'];

  sectorFilters: FilterType[] = ['tech', 'healthcare', 'finance', ];

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks() {
    this.isLoading = true;
    this.stockservice.getAllStocks().subscribe({
      next: (stocks) => {
        if (stocks) {
          this.allStocks = stocks;
          this.filteredStocks = [...stocks];
          this.isLoading = false;
          console.log('Loaded stocks:', stocks.length);
        }
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filterType: string) {
      const validFilter = filterType as FilterType;
    this.activeFilter = validFilter;
    
    switch (filterType) {
      case 'all':
        this.filteredStocks = [...this.allStocks];
        break;
        
      case 'trending':
        // Stocks with moderate positive change (1-5%)
        this.filteredStocks = this.allStocks.filter(stock => {
          const change = stock.changePercentage || 0;
          return change >= 1 && change <= 5;
        });
        break;
        
      case 'gainers':
        // Top gainers - positive change, sorted by highest change
        this.filteredStocks = this.allStocks
          .filter(stock => (stock.changePercentage || 0) > 0)
          .sort((a, b) => (b.changePercentage || 0) - (a.changePercentage || 0))
          .slice(0, 20); // Top 20 gainers
        break;
        
      case 'losers':
        // Top losers - negative change, sorted by lowest change
        this.filteredStocks = this.allStocks
          .filter(stock => (stock.changePercentage || 0) < 0)
          .sort((a, b) => (a.changePercentage || 0) - (b.changePercentage || 0))
          .slice(0, 20); // Top 20 losers
        break;
        
      case 'volume':
        // High volume stocks
        this.filteredStocks = this.allStocks
          .filter(stock => stock.Volume&& stock.Volume > 1000000)
          .sort((a, b) => (b.Volume || 0) - (a.Volume || 0))
          .slice(0, 25); // Top 25 by volume
        break;
        
      case 'tech':
        // Technology sector
        this.filteredStocks = this.allStocks.filter(stock => 
          stock.sector?.toLowerCase().includes('tech') || 
          stock.sector?.toLowerCase().includes('software') ||
          stock.sector?.toLowerCase().includes('internet')
        );
        break;
        
      case 'healthcare':
        // Healthcare sector
        this.filteredStocks = this.allStocks.filter(stock => 
          stock.sector?.toLowerCase().includes('health') ||
          stock.sector?.toLowerCase().includes('pharma') ||
          stock.sector?.toLowerCase().includes('biotech')
        );
        break;
        
      case 'finance':
        // Financial sector
        this.filteredStocks = this.allStocks.filter(stock => 
          stock.sector?.toLowerCase().includes('financ') ||
          stock.sector?.toLowerCase().includes('bank') ||
          stock.sector?.toLowerCase().includes('insurance')
        );
        break;
      case 'Suggested':
        this.filteredStocks = this.stockanalysis.getStockSuggestions();
        console.log(this.stockanalysis.getStockSuggestions())
        break;
        
      default:
        this.filteredStocks = [...this.allStocks];
    }
    
    console.log(`Applied ${filterType} filter: ${this.filteredStocks.length} stocks`);
  }

  getFilterLabel(filterType:string): string {
    const validFilter = filterType as FilterType;
    this.activeFilter = validFilter;
    const labels = {
      'all': 'All Stocks',
      'trending': 'Trending',
      'gainers': 'Top Gainers',
      'losers': 'Top Losers',
      'volume': 'High Volume',
      'tech': 'Technology',
      'healthcare': 'Healthcare',
      'finance': 'Financial',
      'Suggested': 'Suggested Stocks'
    };
    return labels[validFilter];
  }

  getFilterIcon(filterType: string): string {
    const validFilter = filterType as FilterType;
    this.activeFilter = validFilter;
    const icons = {
      'all': 'fas fa-list',
      'trending': 'fas fa-fire',
      'gainers': 'fas fa-arrow-up text-success',
      'losers': 'fas fa-arrow-down text-danger',
      'volume': 'fas fa-chart-bar',
      'tech': 'fas fa-microchip',
      'healthcare': 'fas fa-heartbeat',
      'finance': 'fas fa-university',
      'Suggested': 'fas fa-star'
    };
    return icons[validFilter];
  }

  // Getter for template access
  get stocks() {
    return this.filteredStocks;
  }

  //helper methods
  // Add this method to StockListComponent
trackByStockId(index: number, stock: stock): number {
  return stock.id ?? -1; // Use -1 as a fallback if id is undefined
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

formatVolume(volume: number): string {
  if (!volume) return 'N/A';
  
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toLocaleString();
}
// Add to stock-list.component.ts
watchlistStocks: Set<number> = new Set();
isUpdatingWatchlist = false;
addToWatchlist(stock: stock) {
  this.isUpdatingWatchlist = true;
  if (stock.id !== undefined) {
    this.stockservice.AddToWatchlist(stock.id).subscribe({
      next: (response) => {
        console.log('Successfully added to watchlist:', stock.symbol);
        this.watchlistStocks.add(stock.id!);
        this.isUpdatingWatchlist = false;
        this.toastr.success(`${stock.symbol} added to watchlist`);
      },
      error: (error) => {
        console.error('Error adding to watchlist:', error);
        this.isUpdatingWatchlist = false;
       
        this.toastr.error('Failed to add to watchlist');
      }
    });
  } else {
    console.error('Stock ID is undefined, cannot add to watchlist.');
  }
  console.log('Adding to watchlist:', stock.symbol);
}
removeFromWatchlist(stock: stock) {
  this.stockservice.removeFromWatchlist(stock.id!).subscribe({
    next: (response) => {
      console.log('Successfully removed from watchlist:', stock.symbol);
      this.watchlistStocks.delete(stock.id!);
      this.isUpdatingWatchlist = false;
      this.toastr.success(`${stock.symbol} removed from watchlist`);
    },
    error: (error) => {
      console.error('Error removing from watchlist:', error);
      this.isUpdatingWatchlist = false;
      this.toastr.error('Failed to remove from watchlist');
    }
  })
  this.isUpdatingWatchlist = true;
  console.log('Removing from watchlist:', stock.symbol);
}
//modal 
showBuyModal = false;
  selectedStock: stock | null = null;
  buyRequest: BuyStockRequest = {
    symbol: '',
    quantity: 1,
    purchaseDate: undefined
  };
  buyLoading = false;
  buyError: string | null = null;
  buySuccess: string | null = null;
  useHistoricalDate = false;
  maxDate = new Date().toISOString().split('T')[0];
  minDate = this.getMinDate();

openBuyModal(stock: stock) {
  this.selectedStock = stock;
  this.buyRequest = {
    symbol: stock.symbol,
    quantity: 1,
    purchaseDate: undefined
  };
  this.useHistoricalDate = false;
  this.buyError = null;
  this.buySuccess = null;
  this.showBuyModal = true;
}

closeBuyModal() {
  this.showBuyModal = false;
  this.selectedStock = null;
  this.buyError = null;
  this.buySuccess = null;
  this.buyLoading = false;
}

onBuyStock() {
  if (!this.selectedStock) return;

  // Validate
  const validation = this.portfolioService.validatePurchase(this.buyRequest);
  if (!validation.isValid) {
    this.buyError = validation.errors.join(', ');
    return;
  }

  this.buyLoading = true;
  this.buyError = null;
  this.buySuccess = null;

  const request: BuyStockRequest = {
    symbol: this.buyRequest.symbol.toUpperCase(),
    quantity: this.buyRequest.quantity,
    purchaseDate: this.useHistoricalDate ? this.buyRequest.purchaseDate : undefined
  };

  this.portfolioService.buyStock(request).subscribe({
    next: (response) => {
      this.buyLoading = false;
      this.buySuccess = `Successfully purchased ${response.quantity} shares of ${response.stockSymbol} for ${this.portfolioService.formatCurrency(response.purchaseValue)}`;
      
      // Close modal after 2 seconds
      setTimeout(() => {
        this.closeBuyModal();
      }, 2000);
    },
    error: (err) => {
      this.buyLoading = false;
      this.buyError = err.error?.message || err.error || 'Failed to purchase stock. Please try again.';
      console.error('Purchase error:', err);
    }
  });
}

getEstimatedTotal(): number {
  if (!this.selectedStock || !this.buyRequest.quantity) return 0;
  return (this.selectedStock?.sharePrice ?? 0) * (this.buyRequest.quantity ?? 0);
}

formatCurrency(value: number): string {
  return this.portfolioService.formatCurrency(value);
}

private getMinDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 147);
  return date.toISOString().split('T')[0];
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

// Update button state methods
canAdd(stock: stock): boolean {
  return stock !== null && !this. stockservice.isInWatchList(stock.symbol);
}

canRemove(stock: stock): boolean {
  return stock !== null && this. stockservice.isInWatchList(stock.symbol);
}

}



