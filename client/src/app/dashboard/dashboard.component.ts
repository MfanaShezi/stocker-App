import { Component, inject, OnInit } from '@angular/core';
import { StockService } from '../_services/stock.service';
import { StockAnalysisService } from '../_services/stock-analysis.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, TooltipItem, ChartTypeRegistry } from 'chart.js';
import { stock } from '../_models/stock';
import { AccountService } from '../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ExposureRisk } from '../_models/ExposureRisk';
import { AlertService } from '../_services/alert.service';
import { PortfolioService } from '../_services/portfolio.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private stockservice = inject(StockService);
  public stockanalysis = inject(StockAnalysisService);
  private accountService = inject(AccountService);
  private router = inject(Router);
  alertservice=inject(AlertService);
  private portfolioService = inject(PortfolioService);
  private toastr = inject(ToastrService);
 
  suggestedStocks: stock[] = [];
  exposureRisks: ExposureRisk[] = [];
  watchlistStocks: stock[] = [];
  topStocks: any[] = [];
  selectedTimeframe: string = '3';
   
  isLoading = true;

  ngOnInit() {
    this.loadDashboardData();
    this.loadSuggestedStocks();
    this.triggerAlerts();
    this.updateChartData();
  }

  // watchlist  Line Chart
  public portfolioChartType: ChartType = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Portfolio Value',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  updateChartData() {
    if (!this.watchlistStocks || this.watchlistStocks.length === 0) {
      this.lineChartData = {
        labels: [],
        datasets: []
      };
      return;
    }

    const startDate = this.getStartDate();
    const endDate = new Date();
    
    // Collect all unique dates across all stocks
    const allPriceDates = new Set<string>();
    this.watchlistStocks.forEach(stock => {
      if (stock.prices) {
        stock.prices.forEach(price => {
          const priceDate = new Date(price.date);
          if (priceDate >= startDate && priceDate <= endDate) {
            allPriceDates.add(price.date);
          }
        });
      }
    });
    
    // Sort dates
    const sortedDates = Array.from(allPriceDates).sort();
    
    // Sample dates for chart (to avoid too many data points)
    const sampleInterval = this.getSampleInterval();
    const sampledDates: string[] = [];
    for (let i = 0; i < sortedDates.length; i += sampleInterval) {
      sampledDates.push(sortedDates[i]);
    }
    
    // Create datasets for each stock
    const datasets = this.watchlistStocks.map((stock, index) => {
      const data = sampledDates.map(date => {
        if (stock.prices) {
          const priceOnDate = stock.prices.find(p => p.date === date);
          return priceOnDate ? priceOnDate.close : null;
        }
        return null;
      });
      
      // Generate colors for each stock line
      const colors = this.getChartColors();
      
      return {
        label: stock.symbol,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20', // Add transparency
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4
      };
    });
    
    // Format dates for labels
    const labels = sampledDates.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: this.selectedTimeframe === '1Y' || this.selectedTimeframe === '2Y' ? '2-digit' : undefined
      });
    });
    
    this.lineChartData = {
      labels: labels,
      datasets: datasets
    };
  }

  // Helper method to get sample interval based on timeframe
  private getSampleInterval(): number {
    const timeframe = parseInt(this.selectedTimeframe);
    if (timeframe <= 1) return 1; // Daily for 1 month
    if (timeframe <= 3) return 2; // Every other day for 3 months
    if (timeframe <= 6) return 5; // Every 5 days for 6 months
    return 10; // Every 10 days for longer periods
  }

  getStartDate(): Date {
    // Calculate the desired start date based on timeframe
    const timeframe = parseInt(this.selectedTimeframe);
    const endDate = new Date();
    const desiredStartDate = new Date();
    desiredStartDate.setMonth(endDate.getMonth() - timeframe);
  
    // Find the earliest available date across all watchlist stocks
    let earliestAvailableDate: Date | null = null;
    
    if (this.watchlistStocks && this.watchlistStocks.length > 0) {
      this.watchlistStocks.forEach(stock => {
        if (stock.prices && stock.prices.length > 0) {
          // Sort prices by date (ascending)
          stock.prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Get the earliest date for this stock
          const stockEarliestDate = new Date(stock.prices[0].date);
          
          // Update overall earliest date
          if (!earliestAvailableDate || stockEarliestDate < earliestAvailableDate) {
            earliestAvailableDate = stockEarliestDate;
          }
        }
      });
    }
    return desiredStartDate;
  }
  // Helper method to get chart colors
  private getChartColors(): string[] {
    return [
      '#FF6384', // Red
      '#36A2EB', // Blue
      '#FFCE56', // Yellow
      '#4BC0C0', // Teal
      '#9966FF', // Purple
      '#FF9F40', // Orange
      '#FF6384', // Pink
      '#C9CBCF', // Grey
      '#4BC0C0', // Light Blue
      '#FF6384'  // Dark Red
    ];
  }

  // Update chart options for multiple lines
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(tooltipItem: TooltipItem<ChartType>) {
            const label = tooltipItem.dataset.label || 'Unknown';
            const value = tooltipItem.parsed.y !== undefined ? tooltipItem.parsed.y.toFixed(2) : 'N/A';
            return `${label}: $${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)'
        },
        ticks: {
          callback: function(tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return '$' + tickValue.toFixed(2);
            }
            return tickValue; // Return as-is if not a number
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  updateChartOptions() {
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(tooltipItem: TooltipItem<keyof ChartTypeRegistry>) {
              const label = tooltipItem.dataset.label || 'Unknown';
              const value = tooltipItem.parsed.y !== undefined ? tooltipItem.parsed.y.toFixed(2) : 'N/A';
              return `${label}: $${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          },
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price ($)'
          },
          ticks: {
            callback: function(tickValue: string | number) {
              if (typeof tickValue === 'number') {
                return '$' + tickValue.toFixed(2);
              }
              return tickValue; // Return as-is if not a number
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }


//donut chart for sectors

  public sectorChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  public sectorChartType: ChartType = 'doughnut';

  // Update the pie chart initialization (around lines 95-110)
  pieChartData: any = {
    labels: [], // Start with empty labels
    datasets: [
      {
        data: [], // Start with empty data
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 2,
      }
    ]
  };


  triggerAlerts(){
    this.alertservice.getAlerts().subscribe({
      next: (alerts) => {
        console.log('Alerts loaded:', alerts);
        // Handle the alerts data here
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  private loadSuggestedStocks(): void {
    //this.isLoadingSuggestions = true;
    
    setTimeout(() => {
      try {
        const suggestions = this.stockanalysis.getStockSuggestions();
        this.suggestedStocks = suggestions.slice(0, 5); // Limit to 5 stocks
        console.log('Loaded suggested stocks:', this.suggestedStocks.length);
      } catch (error) {
        console.error('Error loading suggested stocks:', error);
        this.suggestedStocks = [];
      } finally {
       // this.isLoadingSuggestions = false;
      }
    }, 500);
  }
  viewSuggestedStock(stockId: number): void {
    this.router.navigate(['/stocks', stockId]);
  }
  loadDashboardData() {
    this.isLoading = true;
    
    // Load watchlist stocks
    this.loadWatchlistStocks();
    
    // Load top performing stocks
    this.loadTopStocks();
    
    // Generate portfolio performance data
    this.generatePortfolioData();
    
    this.isLoading = false;
  }

  loadWatchlistStocks() {
    console.log('Loading watchlist - Current user:', this.accountService.currentUser());
    console.log('Loading watchlist - Token exists:', !!this.accountService.currentUser()?.token);
    this.stockservice.getwatchlist().subscribe({
      next: (watchlistStocks) => {
        this.watchlistStocks = watchlistStocks || [];
        // Update sector allocation based on watchlist
        this.updateSectorAllocation();
      },
      error: (error) => {
        console.error('Error loading watchlist stocks:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);
        this.watchlistStocks = [];
      }
    });
  }

  updateSectorAllocation() {
    if (!this.watchlistStocks || this.watchlistStocks.length === 0) {
      // Reset to empty if no watchlist
      this.pieChartData.labels = ['No Data'];
      this.pieChartData.datasets[0].data = [1];
      return;
    }
    const totalStocks = this.watchlistStocks.length;
    // Count stocks by sector
    const sectorCounts = this.watchlistStocks.reduce((acc: any, stock: any) => {
      const sector = stock.sector || 'Other';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});
  

    const sectorRegionCounts = this.watchlistStocks.reduce((acc: any, stock: any) => {
      const sector = stock.sector || 'Other';
      const region = stock.region || stock.country || 'Unknown';
      const key = `${sector} - ${region}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Create labels with percentages
  const labelsWithPercentages = Object.keys(sectorCounts).map(sector => {
    const count = sectorCounts[sector];
    const percentage = ((count / totalStocks) * 100).toFixed(1);
    return `${sector} (${percentage}%)`;
  });

  this.pieChartData.labels = labelsWithPercentages;
  this.pieChartData.datasets[0].data = Object.values(sectorCounts);
  }

  loadTopStocks() {
    console.log('Loading top performing stocks...');
  this.stockservice.getAllStocks().subscribe({
    next: (allStocks) => {
      // Calculate scores for all stocks and sort by highest scores
      if (allStocks) {
        this.topStocks = allStocks
          .map(stock => ({
            ...stock,
            score: this.stockanalysis.calculateStockScore(stock),
            buySignal: this.stockanalysis.getBuySignal(stock)
          }))
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .slice(0, 5); // Take top 5
      } else {
        this.topStocks = [];
      }
        
      console.log('Top 5 scoring stocks loaded:', this.topStocks);
    },
    error: (error) => {
      console.error('Error loading stocks for top performance:', error);
      this.topStocks = [];
    }
  });
  }
  timeframeOptions = [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' },
    { value: '24', label: '2 Years' }
  ];

  generatePortfolioData() {
    // Calculate portfolio performance based on actual stock prices
    const dates: string[] = [];
    const values: number[] = [];
    
    // Get the last 6 months of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(this.selectedTimeframe));
    
    // Collect all available price dates from watchlist stocks
    const allPriceDates = new Set<string>();
    this.watchlistStocks.forEach(stock => {
      if (stock.prices) {
        stock.prices.forEach(price => {
          const priceDate = new Date(price.date);
          if (priceDate >= startDate && priceDate <= endDate) {
            allPriceDates.add(price.date);
          }
        });
      }
    });
    
    // Sort dates
    const sortedDates = Array.from(allPriceDates).sort();
    
    // Calculate portfolio value for each date
    const portfolioValues = sortedDates.map(date => {
      let totalValue = 0;
      let stockCount = 0;
      
      this.watchlistStocks.forEach(stock => {
        if (stock.prices) {
          const priceOnDate = stock.prices.find(p => p.date === date);
          if (priceOnDate) {
            // Assume equal weight allocation (you can modify this)
            totalValue += priceOnDate.close;
            stockCount++;
          }
        }
      });
      return stockCount > 0 ? totalValue / stockCount * 1000 : 0; // Multiply by 1000 for realistic portfolio size
    });
    
    // Sample data points for chart (weekly intervals)
    const sampleInterval = parseInt(this.selectedTimeframe) <= 6 ? 7 : 14; // Weekly for ≤6 months, bi-weekly for longer
  
    for (let i = 0; i < sortedDates.length; i += sampleInterval) {
      const date = new Date(sortedDates[i]);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      values.push(Math.round(portfolioValues[i] * 100) / 100);
    }
    
    console.log('Portfolio performance updated with real data:', { dates: dates.length, values: values.length });
  }
  
  onTimeframeChange() {
    this.generatePortfolioData();
  }

  removeFromWatchlist(stock: stock) {
    this.stockservice.removeFromWatchlist(stock.id!).subscribe({
      next: (response) => {
        console.log('Successfully removed from watchlist:', stock.symbol);
        this.watchlistStocks = this.watchlistStocks.filter(s => s.id !== stock.id);
        this.toastr.success(`${stock.symbol} removed from watchlist`);
      },
      error: (error) => {
        console.error('Error removing from watchlist:', error);
        this.toastr.error('Failed to remove from watchlist');
      }
    })
    console.log('Removing from watchlist:', stock.symbol);
  }

  getChangeClass(changePercentage: number): string {
    return changePercentage >= 0 ? 'text-success' : 'text-danger';
  }

  getChangeIcon(changePercentage: number): string {
    return changePercentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 85) return 'bg-success';
    if (score >= 70) return 'bg-primary';
    if (score >= 55) return 'bg-warning';
    return 'bg-danger';
  }

  getSignalBadgeClass(signal: string): string {
    if (signal === 'Strong Buy' || signal === 'Buy') return 'bg-success';
    if (signal === 'Research') return 'bg-warning';
    return 'bg-danger';
  }

  getPortfoliovalue (): number{
  let counter=0;
    this.stockservice.watchliststocks()?.forEach(stock=>{
      stock.sharePrice ? counter += stock.sharePrice : 0;
    });
    return counter;
  }
  getPortfolioChange (): number{
    let counter=0;
      this.stockservice.watchliststocks()?.forEach(stock=>{
        stock.changePercentage ? counter += stock.changePercentage : 0;
      });
      return counter;
    }

    canRemove(stock: stock): boolean {
      return stock !== null && this. stockservice.isInWatchList(stock.symbol);
    }
}