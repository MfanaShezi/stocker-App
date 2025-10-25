import { Component, inject, OnInit } from '@angular/core';
import { BuyStockRequest, PortfolioHolding, PortfolioService, PortfolioSummary } from '../_services/portfolio.service';
import { PortfolioResponse, Purchase } from '../_models/PortfolioResponse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StockService } from '../_services/stock.service';
import { BaseChartDirective } from 'ng2-charts';
import { stock } from '../_models/stock';
import { StockAnalysisService } from '../_services/stock-analysis.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule,FormsModule,BaseChartDirective,RouterLink],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {


  portfolioData: PortfolioResponse | null = null;
  groupedHoldings: PortfolioHolding[] = [];
  portfolioSummary: PortfolioSummary | null = null;
  individualPurchases: Purchase[] = [];
  portfolioService=inject(PortfolioService);
  private stockService = inject(StockService);
  public stockanalysis=inject(StockAnalysisService);
  router=inject(Router);


  loading = true;
  error: string | null = null;

  // Display options
  showIndividualPurchases = false;
  sortBy = 'symbol';
  sortDirection: 'asc' | 'desc' = 'asc';
  ngOnInit() {
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.loading = true;
    this.error = null;

    // Get portfolio data
    this.portfolioService.getPortfolioData().subscribe({
      next: (data) => {
        this.portfolioData = data;
        this.individualPurchases = data.purchases;
        this.calculateSummary(data);
        this.loadGroupedHoldings();
      },
      error: (err) => {
        this.error = 'Failed to load portfolio data';
        this.loading = false;
        console.error('Portfolio error:', err);
      }
    });
  }

  loadGroupedHoldings() {
    this.portfolioService.getGroupedHoldings().subscribe({
      next: (holdings) => {
        this.groupedHoldings = holdings;
        this.sortHoldings();
        this.updateSectorAllocationChart();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to process portfolio holdings';
        this.loading = false;
        console.error('Holdings error:', err);
      }
    });
  }

  calculateSummary(data: PortfolioResponse) {
    const currentValue = data.purchases.reduce((sum, p) => sum + p.currentValue, 0);
    const totalProfitLoss = data.purchases.reduce((sum, p) => sum + p.profitLoss, 0);
    const totalProfitLossPercentage = data.totalInvested > 0 ? 
      (totalProfitLoss / data.totalInvested) * 100 : 0;

    this.portfolioSummary = {
      totalInvested: data.totalInvested,
      currentValue,
      totalProfitLoss,
      totalProfitLossPercentage,
      totalPositions: this.getUniqueStockCount(data.purchases)
    };
  }

  getUniqueStockCount(purchases: Purchase[]): number {
    const uniqueSymbols = new Set(purchases.map(p => p.stockSymbol));
    return uniqueSymbols.size;
  }

  // Sorting functionality
  sortHoldings() {
    this.groupedHoldings.sort((a, b) => {
      let valueA: any, valueB: any;

      switch(this.sortBy) {
        case 'symbol':
          valueA = a.symbol;
          valueB = b.symbol;
          break;
        case 'profitLoss':
          valueA = a.profitLoss;
          valueB = b.profitLoss;
          break;
        case 'profitLossPercentage':
          valueA = a.profitLossPercentage;
          valueB = b.profitLossPercentage;
          break;
        case 'currentValue':
          valueA = a.currentValue;
          valueB = b.currentValue;
          break;
        default:
          valueA = a.symbol;
          valueB = b.symbol;
      }

      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.sortHoldings();
  }

  toggleView() {
    this.showIndividualPurchases = !this.showIndividualPurchases;
  }

  // Utility methods
  formatCurrency(value: number): string {
    return this.portfolioService.formatCurrency(value);
  }

  formatPercentage(value: number): string {
    return this.portfolioService.formatPercentage(value);
  }

  getRowClass(profitLoss: number): string {
    return profitLoss >= 0 ? 'profit' : 'loss';
  }

  getSummaryClass(profitLoss: number): string {
    if (profitLoss > 0) return 'summary-positive';
    if (profitLoss < 0) return 'summary-negative';
    return 'summary-neutral';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  //sector Donut chart 
  //sector properties
  sectorAllocationData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#28a745', // Technology - Green
          '#007bff', // Healthcare - Blue  
          '#ffc107', // Financial - Yellow
          '#dc3545', // Consumer - Red
          '#6f42c1', // Industrial - Purple
          '#fd7e14', // Energy - Orange
          '#20c997', // Utilities - Teal
          '#e83e8c', // Materials - Pink
          '#6c757d'  // Others - Gray
        ],
        borderWidth: 3,
        borderColor: '#fff',
        hoverBackgroundColor: [
          '#218838',
          '#0056b3',
          '#e0a800',
          '#c82333',
          '#59359a',
          '#e8650e',
          '#1aa179',
          '#d91a72',
          '#545b62'
        ]
      }
    ]
  };
//chart configuration
sectorChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = this.formatCurrency(context.parsed as number);
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = (((context.parsed as number) / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

//chart type
sectorChartType: ChartType = 'doughnut';

updateSectorAllocationChart() {
  if (!this.groupedHoldings || this.groupedHoldings.length === 0) {
    this.sectorAllocationData.labels = ['No Portfolio Data'];
    this.sectorAllocationData.datasets[0].data = [1];
    return;
  }

  // Get cached stocks from service
  const cachedStocks = this.stockService.stocks();
  
  if (!cachedStocks || cachedStocks.length === 0) {
    // If no cached stocks, load them first
    this.stockService.getAllStocks().subscribe({
      next: (stocks) => {
        this.processSectorAllocation(stocks || []);
      },
      error: (err) => {
        console.error('Error loading stocks for sector data:', err);
        this.showDefaultSectorChart();
      }
    });
  } else {
    // Use cached stocks
    this.processSectorAllocation(cachedStocks);
  }
}

// Process sector allocation with real stock data
processSectorAllocation(stocks: any[]) {
  if (!stocks || stocks.length === 0) {
    this.showDefaultSectorChart();
    return;
  }

  // Create a map of symbol to sector
  const symbolToSectorMap = new Map();
  stocks.forEach(stock => {
    if (stock.sector) {
      symbolToSectorMap.set(stock.symbol, stock.sector);
    }
  });

  // Group holdings by sector
  const sectorTotals: { [key: string]: number } = {};
  
  this.groupedHoldings.forEach(holding => {
    const sector = symbolToSectorMap.get(holding.symbol) || 'Other';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + holding.currentValue;
  });

  // Convert to arrays for chart
  const sectors = Object.keys(sectorTotals);
  const values = Object.values(sectorTotals);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    this.showDefaultSectorChart();
    return;
  }

  // Create labels with percentages
  const labelsWithPercentages = sectors.map(sector => {
    const percentage = ((sectorTotals[sector] / total) * 100).toFixed(1);
    return `${sector} (${percentage}%)`;
  });

  this.sectorAllocationData.labels = labelsWithPercentages;
  this.sectorAllocationData.datasets[0].data = values;
}

// Fallback for when no sector data is available
showDefaultSectorChart() {
  this.sectorAllocationData.labels = ['Sector Data Unavailable'];
  this.sectorAllocationData.datasets[0].data = [1];
}

// Updated sector stats method using real data
getSectorStats() {
  if (!this.groupedHoldings || this.groupedHoldings.length === 0) {
    return { mostAllocated: 'N/A', leastAllocated: 'N/A', diversification: 'N/A' };
  }

  // Get cached stocks
  const cachedStocks = this.stockService.stocks();
  if (!cachedStocks) {
    return { mostAllocated: 'Loading...', leastAllocated: 'Loading...', diversification: 'Loading...' };
  }

  // Create symbol to sector map
  const symbolToSectorMap = new Map();
  cachedStocks.forEach(stock => {
    if (stock.sector) {
      symbolToSectorMap.set(stock.symbol, stock.sector);
    }
  });

  // Calculate sector totals
  const sectorTotals: { [key: string]: number } = {};
  
  this.groupedHoldings.forEach(holding => {
    const sector = symbolToSectorMap.get(holding.symbol) || 'Other';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + holding.currentValue;
  });

  const sectors = Object.entries(sectorTotals).sort((a, b) => b[1] - a[1]);
  const totalSectors = Object.keys(sectorTotals).length;

  return {
    mostAllocated: sectors[0]?.[0] || 'N/A',
    leastAllocated: sectors[sectors.length - 1]?.[0] || 'N/A',
    diversification: totalSectors > 5 ? 'Well Diversified' : 
                    totalSectors > 3 ? 'Moderately Diversified' : 'Concentrated'
  };
}

// Helper method to get sector for a specific symbol
getSectorBySymbol(symbol: string): string {
  const cachedStocks = this.stockService.stocks();
  if (!cachedStocks) return 'Unknown';
  
  const stock = cachedStocks.find(s => s.symbol === symbol);
  return stock?.sector || 'Other';
}
getLargestPosition(): string {
  if (!this.groupedHoldings || this.groupedHoldings.length === 0) {
    return 'N/A';
  }
  
  const largest = this.groupedHoldings.reduce((prev, current) => 
    prev.currentValue > current.currentValue ? prev : current
  );
  
  return largest.symbol;
}
//selling 
sellAllShares(symbol: string, event?: Event) {
  if (event) event.stopPropagation();
  
  // Find the holding to get total shares for confirmation
  const holding = this.groupedHoldings.find(h => h.symbol === symbol);
  const totalShares = holding?.totalQuantity || 0;
  
  if (totalShares === 0) {
    alert('No shares found for this stock.');
    return;
  }

  const confirmMessage = `Are you sure you want to remove ${symbol}?`;
  
  if (confirm(confirmMessage)) {
    this.portfolioService.sellStock(symbol).subscribe({
      next: (response) => {
        console.log('All shares sold successfully:', response);
        alert(response.message); // Show success message from backend
        // Refresh portfolio data
        this.loadPortfolio();
      },
      error: (err) => {
        console.error('Error selling all shares:', err);
        alert('Failed to sell shares. Please try again.');
      }
    });
  }
}

//Modal
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

  mapPurchaseToStock(purchase: Purchase): stock {
      return {
        name: purchase.companyName || 'Unknown',
        symbol: purchase.stockSymbol || 'N/A',
        sharePrice: purchase.currentPrice || 0,
      };
    }
    mapholdingtostock(holding: PortfolioHolding): stock {
      return {
        name: holding.companyName || 'Unknown',
        symbol: holding.symbol || 'N/A',
        sharePrice: holding.currentPrice || 0,
      };
    }

    GetStockDetails(symbol: string): void {
      for(let stock of this.stockService.stocks() || []){
        if(stock.symbol.toUpperCase()===symbol.toUpperCase()){
          this.router.navigate(['/stocks', stock.id]);
          break;
        }
      }
    }
}



