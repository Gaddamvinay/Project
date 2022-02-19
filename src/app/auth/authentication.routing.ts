import { Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component'
import { RememberMeGuardService } from './remember-me-guard.service';
export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '404',
        component: ErrorComponent
      },
      {
        path: 'forgot',
        component: ForgotComponent
      },
      {
        path: 'reset',
        component: ResetpasswordComponent
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [RememberMeGuardService]
      }
    ]
  }
];
