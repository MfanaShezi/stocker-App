import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { InvestmentGoal, InvestmentStyle, RegisterUser, RiskAppetite, User } from '../_models/User';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
private accountService = inject(AccountService);
private router = inject(Router);

  model:RegisterUser = {
    username: '',
    password: '',
    ConfirmPassword: '',
    fullName: '',
    email: '',
    investmentStyle:InvestmentStyle.Balanced ,
    riskAppetite: RiskAppetite.Low, 
    investmentGoal: InvestmentGoal.Growth
  };

  isLoading = false;
  errorMessage = '';
  register() {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Registering user:', this.model);

    this.accountService.Register(this.model).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        // Redirect to home or dashboard after successful registration
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigateByUrl('/');
  }
} 
