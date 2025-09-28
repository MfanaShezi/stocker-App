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
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/solid-gauge';
import { BuyStockRequest, PortfolioService } from '../../_services/portfolio.service';
import { FormsModule } from '@angular/forms';
import { Purchase } from '../../_models/PortfolioResponse';


@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
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

    //console.log('Loading sentiment data.. for symbol:', this.stock.symbol, '.');

    // this.sentimentLoading = true;
    // this.stockService.getstockSentiment(this.stock.symbol).subscribe({
    //   next: (response) => {
    //     this.sentimentData = response;
    //     console.log('Sentiment data loaded:', this.sentimentData);
    //     this.sentimentLoading = false;
    //     this.createSentimentGauge();
    //   },
    //   error: (error) => {
    //     console.error('Error loading sentiment:', error);
    //     this.sentimentLoading = false;
    //   }
    //});
  }
  createSentimentGauge() {
    console.log('createSentimentGauge called');
    console.log('sentimentData:', this.sentimentData);
    
    if (!this.sentimentData) {
      console.log('No sentiment data available');
      return;
    }
  
    setTimeout(() => {
      const container = document.getElementById('sentiment-gauge');
      console.log('Container element:', container);
      
      if (!container) {
        console.log('Container not found!');
        return;
      }
  
      const score = this.sentimentData!.sentiment.score;
      const sentiment = this.sentimentData!.sentiment.sentiment;
      const normalizedScore =(score/1)*100;
      
      console.log('Score:', score);
      console.log('Sentiment:', sentiment);
      console.log('Normalized score:', normalizedScore);
  
      const gaugeOptions: Highcharts.Options = {
        chart: {
          type: 'solidgauge',
          height: 300,
          backgroundColor: 'transparent'
        },
        title: {
          text: `${this.stock?.symbol} Sentiment`
        },
        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -90,
          endAngle: 90,
          background: [{
            backgroundColor: '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }]
        },
        yAxis: {
          min: 0,
          max: 100,
          stops: [
            [0.33, '#FF4444'],
            [0.66, '#FFA500'],
            [1, '#44AA44']
          ],
          lineWidth: 0,
          tickWidth: 0
        },
        series: [{
          type: 'solidgauge',
          name: 'Sentiment',
          data: [normalizedScore]
        } as Highcharts.SeriesSolidgaugeOptions],
        credits: {
          enabled: false
        }
      };
  
      console.log('About to create chart with options:', gaugeOptions);
  
      try {
        const chart = Highcharts.chart('sentiment-gauge', gaugeOptions);
        console.log('Chart created successfully:', chart);
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }, 500);
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



}
