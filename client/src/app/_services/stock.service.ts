import { inject, Injectable, signal } from '@angular/core';
import { stock } from '../_models/stock';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SentimentResponse } from '../_models/SentimentResponse';

@Injectable({
  providedIn: 'root'
})
export class StockService {
private http=inject(HttpClient);
baseUrl=environment.apiUrl;
stocks=signal<stock[] | null >(null);
watchliststocks=signal<stock[] | null >(null);
cachedstocks=new Map();
cachedwatchliststocks=new Map();



  getAllStocks(): Observable<stock[] | null> {
  // Check if we already have stocks cached in the signal
  const cachedStocks = this.stocks();
  
  if(cachedStocks && cachedStocks.length > 0) {
    console.log(' Returning from cache'); 
    return of(cachedStocks); // Return cached data as Observable
  }
  if (cachedStocks && cachedStocks.length > 0) {
    console.log(' Returning from cache');
    return of(cachedStocks); // Return cached data as Observable
  }
  
  console.log('Fetching from API');
  
  // Return the HTTP Observable and cache the result
  return this.http.get<stock[]>(this.baseUrl + 'stock').pipe(
    tap(stocks => {
      // Cache the stocks in the signal
      this.stocks.set(stocks);
      console.log("Stocks cached:", stocks.length, "items");
    })
  );
}

clearStockCache() {
  this.stocks.set([]);
  console.log("Stock cache cleared");
}

getwatchlist(): Observable<stock[] | null> {
 const cachedwatchliststocks=this.watchliststocks();

  if(cachedwatchliststocks && cachedwatchliststocks.length>0){
    return of(cachedwatchliststocks);
  }

  return this.http.get<stock[]>(`${this.baseUrl}stock/watchlist`).pipe(
    tap(watchliststocks => {
      this.watchliststocks.set(watchliststocks);
      console.log("Watchlist cached:", watchliststocks.length, "items");
    })
  )
}

AddToWatchlist(id: number): Observable<any> {
  return this.http.post(`${this.baseUrl}stock/${id}/watchlist`, {}).pipe(
    tap(() => {
      this.clearWatchlistCache(); 
    })
  );
  }
// Remove from watchlist method
removeFromWatchlist(stockId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}stock/${stockId}/watchlist`).pipe(
    tap(() => {
      // Update the watchlist signal by removing the stock
      const currentWatchlist = this.watchliststocks();
      const updatedWatchlist = currentWatchlist ? currentWatchlist.filter(stock => stock.id !== stockId) : [];
      this.watchliststocks.set(updatedWatchlist);
    })
  );
}

// Alternative: Remove by symbol (if you prefer using symbol instead of ID)
removeFromWatchlistBySymbol(symbol: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}stock/${symbol}/watchlist`).pipe(
    tap(() => {
      // Update the watchlist signal by removing the stock
      const currentWatchlist = this.watchliststocks();
      const updatedWatchlist = currentWatchlist ? currentWatchlist.filter(stock => stock.symbol.toUpperCase() !== symbol.toUpperCase()) : [];
      this.watchliststocks.set(updatedWatchlist);
    })
  );
}
getStockById(id: number): Observable<stock | null> {
  return this.http.get<stock>(`${this.baseUrl}stock/${id}`);
}

getstockBySymbol(symbol: string): Observable<stock | null> {
  return this.http.get<stock>(`${this.baseUrl}stock/search/${symbol}`);
}

getAllEtfs(): Observable<stock[] | null> {
  return this.http.get<stock[]>(`${this.baseUrl}stock/etf`);
}
clearWatchlistCache() {
  this.watchliststocks.set([]);
  console.log("Watchlist cache cleared");
}

getstockSentiment(symbol: string): Observable<any> {
  console.log(`Fetching sentiment for symbol: ${symbol}`);
  return this.http.get<SentimentResponse>(`https://sentiment-analyser-01hx.onrender.com/api/analyse/${symbol}`);
}

// isInWatchList(symbol: string): boolean{
//   if(!this.watchliststocks){

//   }
//   const watchliststocks = this.watchliststocks();

//   return watchliststocks?.some(stock => stock.symbol === symbol) ?? false;
// }

isInWatchList(symbol: string): boolean {
  // If watchlist hasn't been loaded yet, fetch it
  // if ( !this.watchliststocks() || this.watchliststocks()!.length === 0) {
  //   console.log('Watchlist not loaded, fetching...');
  //   // this.getwatchlist().subscribe({
  //   //   next: () => {
        
  //   //   },
  //   //   error: (err) => {
  //   //     console.error('Error loading watchlist:', err);
  //   //     //this.watchlistLoaded.set(true); // Mark as loaded even on error to avoid infinite loops
  //   //   }
  //   // });
  //   return false; // Return false while loading
  // }

  // Check if symbol is in watchlist
  const watchlist = this.watchliststocks();
  console.log('Checking if symbol is in watchlist:', symbol, watchlist);
  return watchlist?.some(s => s.symbol.toUpperCase() === symbol.toUpperCase()) ?? false;
}

}