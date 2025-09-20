import { Component, inject, OnInit } from '@angular/core';
import { StockService } from '../_services/stock.service';
import { StockAnalysisService } from '../_services/stock-analysis.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { stock } from '../_models/stock';
import { AccountService } from '../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ExposureRisk } from '../_models/ExposureRisk';

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

  suggestedStocks: stock[] = [];
  exposureRisks: ExposureRisk[] = [];
  watchlistStocks: stock[] = [];
  topStocks: any[] = [];
  portfolioSummary = {
    totalValue: 0,
    todayChange: 0,
    todayChangePercent: 0,
    PortfolioValue: 0
  };

  riskThreshold = {
    sectorMax: 30, // Max 30% in one sector
    sectorRegionMax: 20 // Max 20% in same sector + region combo
  };

  isLoading = true;

  // Portfolio Line Chart
  public portfolioChartData: ChartData<'line'> = {
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

  public portfolioChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `Portfolio Value: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: '#ebedef'
        },
        ticks: {
          callback: (value) => {
            return '$' + Number(value).toLocaleString();
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

  public portfolioChartType: ChartType = 'line';



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

  ngOnInit() {
    this.loadDashboardData();
    this.loadSuggestedStocks();
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
    
      // Assess exposure risks (sector and sector-region only)
  this.assessExposureRisks(sectorCounts, sectorRegionCounts, totalStocks);
  }
  assessExposureRisks(sectorCounts: any, sectorRegionCounts: any, totalStocks: number) {
    this.exposureRisks = [];
  
    // Check sector concentration
    Object.entries(sectorCounts).forEach(([sector, count]: [string, any]) => {
      const percentage = (count / totalStocks) * 100;
      if (percentage > this.riskThreshold.sectorMax) {
        this.exposureRisks.push({
          type: 'sector',
          category: sector,
          percentage: Math.round(percentage),
          count,
          riskLevel: percentage > 50 ? 'high' : 'medium',
          message: `${percentage.toFixed(1)}% concentration in ${sector} sector`
        });
      }
    });
  
    // Check sector-region combination
    // Object.entries(sectorRegionCounts).forEach(([combo, count]: [string, any]) => {
    //   const percentage = (count / totalStocks) * 100;
    //   if (percentage > this.riskThreshold.sectorRegionMax) {
    //     this.exposureRisks.push({
    //       type: 'sector-region',
    //       category: combo,
    //       percentage: Math.round(percentage),
    //       count,
    //       riskLevel: percentage > 35 ? 'high' : 'medium',
    //       message: `${percentage.toFixed(1)}% concentration in ${combo}`
    //     });
    //   }
    // });
  
    console.log('Exposure risks identified:', this.exposureRisks);
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

selectedTimeframe: string = '6'; // Default to 6 months
  timeframeOptions = [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' },
    { value: '24', label: '2 Years' }
  ];

  generatePortfolioData() {
    // if (!this.watchlistStocks || this.watchlistStocks.length === 0) {
    //   // Fallback to mock data if no watchlist
    //   this.generateMockPortfolioData();
    //   return;
    // }
  
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
  
  
    this.portfolioChartData = {
      labels: dates,
      datasets: [
        {
          data: values,
          label: 'Portfolio Value',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    };
    
    console.log('Portfolio performance updated with real data:', { dates: dates.length, values: values.length });
  }
  
  onTimeframeChange() {
    this.generatePortfolioData();
  }
  generateMockPortfolioData() {
    // Fallback method when no real data is available
    const dates = [];
    const values = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
  
    let baseValue = 10000;
    
    for (let i = 0; i < 180; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dailyReturn = (Math.random() - 0.45) * 0.03;
      baseValue *= (1 + dailyReturn);
      
      if (i % 7 === 0) {
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        values.push(Math.round(baseValue * 100) / 100);
      }
    }
  
    this.portfolioChartData = {
      labels: dates,
      datasets: [
        {
          data: values,
          label: 'Portfolio Value',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    };
  }

  removeFromWatchlist(stockId: number) {
    this.watchlistStocks = this.watchlistStocks.filter(stock => stock.id !== stockId);
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
}