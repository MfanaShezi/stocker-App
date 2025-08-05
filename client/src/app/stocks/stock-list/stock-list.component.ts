import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stock } from '../../_models/stock';
import { StockService } from '../../_services/stock.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent implements OnInit {
  stocks: stock[] = [];
  private stockservice = inject(StockService);
  ngOnInit(): void {
    this.loadStocks();
  }
  

    
  loadStocks() {
  this.stockservice.getAllStocks().subscribe({
    next: (stocks) => {
      if (stocks) {
        this.stocks = stocks;
        console.log(stocks[1]);
      }
    },
    error: (error) => {
      console.error('Error loading stocks:', error);
    }
  })
  }

  
}
