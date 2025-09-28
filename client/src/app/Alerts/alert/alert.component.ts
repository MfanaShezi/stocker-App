import { Component, inject, OnInit } from '@angular/core';
import { Alert, AlertType } from '../../_models/Alert';
import { AlertService } from '../../_services/alert.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [DatePipe,CurrencyPipe,CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit {

 private alertService=inject(AlertService);
 private toastr=inject(ToastrService);

  alerts: Alert[] = [];
  loading = false;
  showCreateForm = false;

  ngOnInit(): void {
    this.loadAlerts();
    
  }

  loadAlerts(): void {
    this.loading = true;
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        console.log('Alerts loaded:', alerts);
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load alerts');
        this.loading = false;
      }
    });
  }

  toggleAlert(alert: Alert): void {
    this.alertService.toggleAlert(alert.id).subscribe({
      next: () => {
        alert.isActive = !alert.isActive;
        this.toastr.success(`Alert ${alert.isActive ? 'enabled' : 'disabled'}`);
      },
      error: () => {
        this.toastr.error('Failed to toggle alert');
      }
    });
  }

  deleteAlert(alert: Alert): void {
    if (confirm(`Are you sure you want to delete this alert for ${alert.stockSymbol}?`)) {
      this.alertService.deleteAlert(alert.id).subscribe({
        next: () => {
          this.alerts = this.alerts.filter(a => a.id !== alert.id);
          this.toastr.success('Alert deleted successfully');
        },
        error: () => {
          this.toastr.error('Failed to delete alert');
        }
      });
    }
  }

  getAlertTypeDisplay(alertType: AlertType): string {
    return alertType === AlertType.PriceAbove ? 'Above' : 'Below';
  }

  onAlertCreated(): void {
    this.showCreateForm = false;
    this.loadAlerts();
  }
  
}
