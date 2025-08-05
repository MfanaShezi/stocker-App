import { inject, Injectable, signal } from '@angular/core';
import { stock } from '../_models/stock';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
private http=inject(HttpClient);
baseUrl=environment.apiUrl;
stocks=signal<stock[] | null >(null);
constructor() { }

  getAllStocks():Observable< stock[] | null> {
  return this.http.get<stock[]>(this.baseUrl + 'stock');
}

getStockById(id: number): Observable<stock | null> {
  return this.http.get<stock>(`${this.baseUrl}stock/${id}`);
}

}