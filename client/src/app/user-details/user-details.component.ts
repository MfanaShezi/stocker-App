import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/User';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  isLoading = false;
  accountService=inject(AccountService);
  private toastr = inject(ToastrService);
  
  // Form data for editing
  editForm = {
    investmentStyle: this.user?.investmentStyle || '', 
    riskAppetite: this.user?.riskAppetite || '',
    investmentGoal: this.user?.investmentGoal || ''
  };

  investmentStyleOptions = [
    { value: 0, text: this.getInvestmentStyleText(0) },
    { value: 1, text: this.getInvestmentStyleText(1) },
    { value: 2, text: this.getInvestmentStyleText(2) }
  ];
  
  riskAppetiteOptions = [
    { value: 0, text: this.getRiskAppetiteText(0) },
    { value: 1, text: this.getRiskAppetiteText(1) },
    { value: 2, text: this.getRiskAppetiteText(2) }
  ];
  
  investmentGoalOptions = [
    { value: 0, text: this.getInvestmentGoalText(0) },
    { value: 1, text: this.getInvestmentGoalText(1) },
    { value: 2, text: this.getInvestmentGoalText(2) }
  ];


  ngOnInit() {
    this.loadUserDetails();
  }

  loadUserDetails() {
    this.user = this.accountService.currentUser();
    if (this.user) {
      this.populateEditForm();
    }
  }

  populateEditForm() {
    if (this.user) {
      this.editForm = {
        investmentStyle: this.user && typeof this.user.investmentStyle === 'number' ? (this.user.investmentStyle as number).toString() : '',
        riskAppetite: typeof this.user?.riskAppetite === 'number' ? (this.user.riskAppetite as number).toString() : '',
        investmentGoal: this.user && typeof this.user.investmentGoal === 'number' ? (this.user.investmentGoal as number).toString() : '',
      };
      console.log('Form populated with:', this.editForm);
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.populateEditForm();
    }
  }
  

  cancelEdit() {
    this.editMode = false;
    this.populateEditForm(); // Reset form to original values
  }

  updateUserDetails() {
    if (!this.editForm) return;
    
    this.isLoading = true;
    
    // Create the data to send to the API
    const patchData = {
      investmentStyle: this.editForm.investmentStyle,
      riskAppetite: this.editForm.riskAppetite,
      investmentGoal: this.editForm.investmentGoal
      // Add any other fields that need updating
    };
    
    // Call the account service to update the user
    this.accountService.update(patchData).subscribe({
      next: (updatedUser) => {
        console.log('Profile updated successfully');
        this.user = updatedUser;
        this.editMode = false;
        this.isLoading = false;
        
        // Optionally show success message
        this.toastr.success('Your profile has been updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
        
        // Show error message to the user
        this.toastr.error(error.error?.message || 'Failed to update profile. Please try again.');
      }
    });
  }

  //helper methods
  getInvestmentStyleText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Conservative';
      case 1: return 'Balanced';
      case 2: return 'Aggressive';
      default: return 'Not specified';
    }
  }
  
  getRiskAppetiteText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Not specified';
    }
  }
  
  getInvestmentGoalText(value: number | string | undefined): string {
    if (typeof value === 'string') return value;
    
    switch (value) {
      case 0: return 'Retirement';
      case 1: return 'Growth';
      case 2: return 'Income';
      default: return 'Not specified';
    }
  }

  
}