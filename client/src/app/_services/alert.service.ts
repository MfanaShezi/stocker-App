import { inject, Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Alert, CreateAlert } from '../_models/Alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
private http=inject(HttpClient);
baseUrl=environment.apiUrl;
Alerts = signal<Alert[] | null>(null);
cachedAlerts=new Map();
  getAlerts(): Observable<Alert[]> {
    const cachedAlerts = this.Alerts();
      
    if(cachedAlerts && cachedAlerts.length > 0) {
        console.log(' Returning alerts from cache');
        return of(cachedAlerts); 
    }
    return this.http.get<Alert[]>(`${this.baseUrl}stock/alerts`).pipe(
    tap(alerts => this.Alerts.set(alerts)) // Cache the result
    );
  }

 clearAlertCache(): void {
  console.log('Clearing alerts cache');
    this.cachedAlerts.clear();
    this.Alerts.set(null);
  }


  getAlert(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/${id}`);
  }

  createAlert(alert: CreateAlert): Observable<Alert> {
    return this.http.post<Alert>(this.baseUrl, alert);
  }

  updateAlert(id: number, alert: CreateAlert): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, alert);
  }

  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleAlert(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, {});
  }
}

