import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { User } from '../_models/User';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http=inject(HttpClient);
  private baseUrl = environment.apiUrl;
  currentUser = signal<User| null>(null);

  login(model: any){
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map(user =>{
        if(user){
          this.setCurrentUser(user);
        }
      })
    )
  }
  
  Register(model: any){
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
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
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
  
  
  
}
