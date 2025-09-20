import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authguardGuard: CanActivateFn = (route, state) => {

  const accountService = inject(AccountService);
  const toastr = inject (ToastrService); 
  const router=inject(Router);

  if (accountService.currentUser()) {
    return true;
  } else {
    toastr.error('You must be logged in to access this page!', 'Access Denied');
    router.navigate(['/login']);
    return false;
  }
}
