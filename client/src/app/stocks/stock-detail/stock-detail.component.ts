import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  Inject,
  AfterViewInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { stock } from '../../_models/stock';
import { StockService } from '../../_services/stock.service';
import { StockAnalysisService } from '../../_services/stock-analysis.service';
import { SentimentResponse } from '../../_models/SentimentResponse';
// import Highcharts from 'highcharts';
// import 'highcharts/highcharts-more';
// import 'highcharts/modules/solid-gauge';
import { BuyStockRequest, PortfolioService } from '../../_services/portfolio.service';
import { FormsModule } from '@angular/forms';
import { Purchase } from '../../_models/PortfolioResponse';
import { Alert, AlertType } from '../../_models/Alert';
import { AlertService } from '../../_services/alert.service';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule,FormsModule,BaseChartDirective],
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.css']
})


export class StockDetailComponent implements OnInit, AfterViewInit {
  stock: stock | null = null;
  private chartLoaded = false;
  sentimentData: SentimentResponse | null = null;
  sentimentLoading = false;

  private route = inject(ActivatedRoute);
  private stockService = inject(StockService);
  public stockanalysis=inject(StockAnalysisService)
  private platformId = inject(PLATFORM_ID);
  private portfolioService = inject(PortfolioService);
  private alertService = inject(AlertService);
   private toastr=inject(ToastrService);
   stockservice = inject(StockService);


    showAlertModal = false;
    alertRequest: Alert = {
        id: 0,
        stockSymbol: '',
        alertType: AlertType.PriceAbove,
        targetPrice: 0,
        isActive: true,
        createdAt: new Date(),
        stockId: 0,
        stockName: ''
      };
      alertLoading = false;
      alertError: string | null = null;
      alertSuccess = false;

      openAlertModal() {
        if (!this.stock) return;
        
        this.alertRequest = {
          id: 0, // Provide a default value for the id
          alertType: AlertType.PriceAbove,
          targetPrice: this.stock.sharePrice || 0,
          stockSymbol: this.stock.symbol,
          isActive: true,
          createdAt: new Date(),
          stockId: 0,
          stockName: ''
        };
        this.alertError = null;
        this.alertSuccess = false;
        this.showAlertModal = true;
      }
    
      closeAlertModal() {
        this.showAlertModal = false;
        this.alertError = null;
        this.alertSuccess = false;
        this.alertLoading = false;
      }
    
      createAlert() {
        if (!this.stock) return;
    
        // Validate target price
        if (this.alertRequest.targetPrice <= 0) {
          this.alertError = 'Target price must be greater than 0';
          return;
        }
    
        this.alertLoading = true;
        this.alertError = null;
        this.alertSuccess = false;
    
        const alertData = {
          stockId: this.stock.id!, // Ensure stockId is not undefined
          stockSymbol: this.stock.symbol,
          alertType: this.alertRequest.alertType,
          targetPrice: this.alertRequest.targetPrice,
          isActive: this.alertRequest.isActive
        };
    
        this.alertService.createAlert(alertData).subscribe({
          next: (response) => {
            this.alertLoading = false;
            this.alertSuccess = true;
            
            // Close modal after 2 seconds
            setTimeout(() => {
              this.closeAlertModal();
            }, 2000);
          },
          error: (err) => {
            this.alertLoading = false;
            this.alertError = err.error?.message || err.error || 'Failed to create alert. Please try again.';
            this.toastr.error('Alert creation error:', err);
          }
        });
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
    
  ngOnInit(): void {
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.portfolioService.initializePortfolioData();
    this.stockService.getStockById(id).subscribe({
      next: (result) => {
        this.stock = result;
        // Load sentiment data
        this.loadSentiment();
        // Load chart after view is initialized and stock data is available
        if (isPlatformBrowser(this.platformId) && !this.chartLoaded) {
          setTimeout(() => this.loadTradingViewChart(), 100);
        }
        console.log(this.stock);
        console.log(this.stock?.news)
      },
      error: (error) => console.error(error)
    });
  }

  ngAfterViewInit(): void {
    // Load chart if stock data is already available
    if (isPlatformBrowser(this.platformId) && this.stock && !this.chartLoaded) {
      setTimeout(() => this.loadTradingViewChart(), 100);
    }
  }


  //Sentiment Analysis
  loadSentiment() {
    
    if (!this.stock?.symbol) return;

    console.log('Loading sentiment data.. for symbol:', this.stock.symbol, '.');

    this.sentimentLoading = true;
    this.stockService.getstockSentiment(this.stock.symbol).subscribe({
      next: (response) => {
        this.sentimentData = response;
        this.updateSentimentChart();
        console.log('Sentiment data loaded:', this.sentimentData);
        this.sentimentLoading = false;
        //this.createSentimentGauge();
      },
      error: (error) => {
        console.error('Error loading sentiment:', error);
        this.sentimentLoading = false;
      }
    });
  }
    getSentimentBadgeClass(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-success';
      case 'negative': return 'bg-danger';
      default: return 'bg-warning';
    }
  }
  getSentimentColor(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '#44AA44';
      case 'negative': return '#FF4444';
      default: return '#FFA500';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '';
      case 'negative': return '';
      default: return '';
    }
  }

  loadTradingViewChart(): void {
    if (this.chartLoaded) return;
    
    const container = document.getElementById('tv-advanced-chart');
    if (!container || !this.stock) return;

    // Format symbol for TradingView (exchange:symbol)
    let symbol = this.stock.exchange ? 
      `${this.stock.exchange}:${this.stock.symbol}` : 
      `NASDAQ:${this.stock.symbol}`;

      console.log(this.stock.exchange);

    symbol = this.stock.exchange ? `${this.stock.exchange.toUpperCase()}:${this.stock.symbol}` : `${this.stock.exchange}`;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "hide_top_toolbar": false,
      "hide_side_toolbar": true,
      "allow_symbol_change": true,
      "save_image": true,
      "container_id": "tv-advanced-chart"
    });

    container.innerHTML = ''; // Clear previous content
    container.appendChild(script);
    this.chartLoaded = true;
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
  userPurchases: Purchase[] = [];
  //hasPositions = false;

  sellAllShares() {
    console.log('Sell all shares');
    console.log('Stock symbol:', this.stock?.symbol);
  
    
    //const totalShares = this.getTotalShares();
    const confirmMessage = `Are you sure you want to ${this.stock?.symbol}?`;
    console.log(confirmMessage); 
    // This shows the browser's native confirm dialog
    if (confirm(confirmMessage)) {
      this.portfolioService.sellStock(this.stock?.symbol!).subscribe({
        next: (response) => {
          console.log('stock removed successfully:', response);
          alert(response.message); // Shows browser's native alert
          //this.loadUserPositions(this.stock.symbol);
        },
        error: (err) => {
          console.error('Error removing  stock:', err);
          alert('Failed to remove shares. Please try again.');
        }
      });
    }
  }
  hasPositions(): boolean {
    return this.stock ? this.portfolioService.hasStock(this.stock.symbol) : false;
  }

  canSell(): boolean {
    return this.stock !== null && this.portfolioService.hasStock(this.stock.symbol) && !this.buyLoading;
    // You can ONLY sell if you actually own shares of this stock
  }

  canBuy(): boolean {
    return this.stock !== null && !this.buyLoading;
    // You can ALWAYS buy a stock, even if you already own it
  }

  canAdd():boolean{
    return this.stock !== null && !this.buyLoading && !this.stockService.isInWatchList(this.stock.symbol);
  }

  // donut chart

  sentimentChartData: any = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [0, 0,0],
        backgroundColor: ['#10b981','#ef4444', '#334155'], // Green ,red & dark gray
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  public sentimentChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    // cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          //color: '#f1f5f9', // Light text for dark theme
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
       // titleColor: '#f1f5f9',
        //bodyColor: '#f1f5f9',
        displayColors: false,
        padding: 12
      }
    },
    animation: {
      duration: 1000, // Example of a valid property
      easing: 'easeInOutQuad' // Replace with a valid property
    }
  };

    public sentimentChartType: ChartType = 'doughnut';

    updateSentimentChart() {
      if (!this.sentimentData?.Results) return;
      
      // Get sentiment data
      const positive = this.sentimentData.Results.positiveArticles || 0;
      const negative = this.sentimentData.Results.negativeArticles || 0;
      const neutral = this.sentimentData.Results.neutralArticles || 0;
      
      // Update chart data
      this.sentimentChartData = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            data: [positive, negative, neutral],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], // Green, red & amber
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      };
    }

  // Helper methods for sentiment display
getSentimentScore(sentiment: string): number {
  switch (sentiment.toLowerCase()) {
    case 'positive': return 80;
    case 'neutral': return 50;
    case 'negative': return 20;
    default: return 50;
  }
}


}
