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

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.css']
})
export class StockDetailComponent implements OnInit, AfterViewInit {
  stock: stock | null = null;
  private chartLoaded = false;

  private route = inject(ActivatedRoute);
  private stockService = inject(StockService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.stockService.getStockById(id).subscribe({
      next: (result) => {
        this.stock = result;
        // Load chart after view is initialized and stock data is available
        if (isPlatformBrowser(this.platformId) && !this.chartLoaded) {
          setTimeout(() => this.loadTradingViewChart(), 100);
        }
        console.log(this.stock);
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
}
