import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/User';


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
  
  // Form data for editing
  editForm = {
    investmentStyle: this.user?.investmentStyle || '', 
    riskAppetite: this.user?.riskAppetite || '',
    investmentGoal: this.user?.investmentGoal || ''
  };

  investmentStyleOptions = [
    'Conservative',
    'Balanced',
    'Aggressive'
  ];

  riskAppetiteOptions = [
    'Low',
    'Medium',
    'High'
  ];

  investmentGoalOptions = [
    'Retirement',
    'Growth',
    'Income'
  ];

  constructor(private accountService: AccountService) {}

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
        investmentStyle: this.user.investmentStyle || '',
        riskAppetite: this.user.riskAppetite|| '',
        investmentGoal: this.user.investmentGoal || '',
    
      };
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
    if (!this.user) return;
    
    this.isLoading = true;
    
    // Create patch object with only changed fields
    const patchData: any = {};
   
    if (this.editForm.investmentStyle !== this.user.investmentStyle) {
      patchData.investmentStyle = this.editForm.investmentStyle;
    }
    if (this.editForm.riskAppetite !== this.user.riskAppetite) {
      patchData.riskAppetite = this.editForm.riskAppetite;
    }
    if (this.editForm.investmentGoal !== this.user.investmentGoal) {
      patchData.investmentGoal = this.editForm.investmentGoal;
    }


    if (Object.keys(patchData).length === 0) {
      console.log('No changes detected');
      this.editMode = false;
      this.isLoading = false;
      return;
    }

    // this.accountService.updateUserProfile(patchData).subscribe({
    //   next: (updatedUser) => {
    //     console.log('Profile updated successfully');
    //     this.user = updatedUser;
    //     this.editMode = false;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error updating profile:', error);
    //     this.isLoading = false;
    //   }
    // });
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