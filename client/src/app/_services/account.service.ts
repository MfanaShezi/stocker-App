import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { InvestmentStyle, RegisterUser, User } from '../_models/User';
import { environment } from '../../environments/environment.development';
import { StockService } from './stock.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http=inject(HttpClient);
  private baseUrl = environment.apiUrl;
  currentUser = signal<User| null>(null);
  private stockservice = inject(StockService);
  private alertservice = inject(AlertService);

  login(model: any){
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map(user =>{
        if(user){
          this.setCurrentUser(user);
        }
      })
       
    )
  }
  
  Register(model: RegisterUser){
    const registerData = {
      username: model.username,
      email: model.email,
      password: model.password,
      investmentStyle: Number(model.investmentStyle),
      investmentGoal: Number(model.investmentGoal),
      riskAppetite: Number(model.riskAppetite)
    };
  console.log('Sending registration data:', registerData);

    return this.http.post<User>(this.baseUrl + 'account/register', registerData).pipe(
      map(user =>{
        if(user){
         this.setCurrentUser(user);
        }
        return user;
      })
  
    )
  }
  
  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
   
  }
  
  logout(){
    console.log('Logging out user');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.stockservice.clearWatchlistCache();
    this.alertservice.clearAlertCache();
  }
  
  update(updateData: any) {
    return this.http.patch<User>(this.baseUrl + 'account/update', updateData).pipe(
      map(updatedUser => {
        if (updatedUser) {
          // Update the stored user with new data
          const currentUserData = this.currentUser();
          const updatedUserData = {...currentUserData, ...updatedUser};
          this.setCurrentUser(updatedUserData);
        }
        return updatedUser;
      })
    );
  }
  
  
}
