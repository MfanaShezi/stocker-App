import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { StockService } from '../_services/stock.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule,RouterLink,RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
private router=inject(Router);
accountService = inject(AccountService);
stockservice=inject(StockService)
model: any = {};
searchTerm: string = '';

login(){
  this.accountService.login(this.model).subscribe({
    next: _ => {
      this.router.navigateByUrl('/');
    },
      error: error => console.log(error.error)
      
    })
}

logout() {
  this.accountService.logout();
  this.router.navigateByUrl('/');
}

onSearch(): void {
  const symbol = this.searchTerm.trim().toUpperCase();
  if (symbol) {
    this.stockservice.getstockBySymbol(symbol).subscribe({
      next: (stock) => {
        if (stock) {
          // Stock found, navigate to stock detail page using the stock ID
          this.router.navigate(['/stocks', stock.id]);
        } else {
          // Stock not found, show error or navigate to stocks list
          alert(`Stock symbol "${symbol}" not found`);
          this.router.navigate(['/stocks']);
        }
        // Clear search term after search
        this.searchTerm = '';
      },
      error: (error) => {
        console.error('Error searching for stock:', error);
        alert(`Error searching for "${symbol}". Please try again.`);
        this.searchTerm = '';
      }
    });
  }
}

getetfs(): void {
  this.stockservice.getAllEtfs().subscribe({
    next: (stock) => {
      if (stock) {
        console.log('ETFs fetched successfully:', stock);
        // Stock found, navigate to stock detail page using the stock ID
        this.router.navigate(['/stocks']);
      } else {
        // // Stock not found, show error or navigate to stocks list
        // alert(`Stock symbol "${symbol}" not found`);
        // this.router.navigate(['/stocks']);
      }
    },
    error: (error) => {
      console.error('Error fetching ETFs:', error);
    }
  });
}

}
