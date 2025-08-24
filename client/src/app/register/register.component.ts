import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {


  model: any = {
    username: '',
    password: '',
    fullName: '',
    tradingStyle: '',
    riskAppetite: '',
    investmentGoal: ''
  };

  isLoading = false;

  register() {
  }
} 
