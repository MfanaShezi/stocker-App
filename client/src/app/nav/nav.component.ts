import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule,RouterLink,RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
private router=inject(Router);
model: any = {};
searchTerm: string = '';

login(){
  
}
onSearch(): void {
  const symbol = this.searchTerm.trim().toUpperCase();
  if (symbol) {
    this.router.navigate(['/search', symbol]);
  }
}
}
