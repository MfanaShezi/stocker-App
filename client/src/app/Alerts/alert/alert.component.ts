import { Component, inject, OnInit } from '@angular/core';
import { Alert, AlertType } from '../../_models/Alert';
import { AlertService } from '../../_services/alert.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [DatePipe,CurrencyPipe,CommonModule,FormsModule,RouterLink],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit {

 private alertService=inject(AlertService);
 private toastr=inject(ToastrService);
 router=inject(Router);

  alerts: Alert[] = [];
  loading = false;
  showCreateForm = false;

  ngOnInit(): void {
    this.loadAlerts();
    
  }
  // Edit form properties
  showEditForm = false;
  editAlert: Alert = {
    id: 0,
    stockSymbol: '',
    alertType: AlertType.PriceAbove,
    targetPrice: 0,
    isActive: true,
    createdAt: new Date(),
    stockId: 0,
    stockName: ''
  };
  editLoading = false;
  editError: string | null = null;
  editSuccess = false;

  //Open edit form
  openEditForm(alert: Alert) {
    this.editAlert = { ...alert }; // Copy alert data
    this.editError = null;
    this.editSuccess = false;
    this.showEditForm = true;
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

  viewStock(stockId: number): void {
    this.router.navigate(['/stocks', stockId]);
  }

  toggleAlert(alert: Alert): void {
    this.alertService.toggleAlert(alert.id).subscribe({
      next: () => {
        alert.isActive = !alert.isActive;
        this.toastr.success(`Alert ${alert.isActive ? 'activated' : 'deactivated'} successfully`);
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
  closeEditForm(): void {

    this.showEditForm = false;
  
  }

  updateAlert() {
    if (!this.editAlert.id) return;

    this.editLoading = true;
    this.editError = null;
    this.editSuccess = false;

    this.alertService.updateAlert(this.editAlert.id, this.editAlert).subscribe({
      next: (updatedAlert) => {
        this.editLoading = false;
        this.editSuccess = true;
        
        // Update the alert in the local array
        const index = this.alerts.findIndex(a => a.id === updatedAlert.id);
        if (index !== -1) {
          this.alerts[index] = updatedAlert;
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeEditForm();
        }, 2000);
      },
      error: (err) => {
        this.editLoading = false;
        this.editError = err.error?.message || err.error || 'Failed to update alert. Please try again.';
        console.error('Update alert error:', err);
      }
    });
  }

 

}
