import { Routes } from '@angular/router';
import { StockListComponent } from './stocks/stock-list/stock-list.component';
import { HomeComponent } from './home/home.component';
import { StockDetailComponent } from './stocks/stock-detail/stock-detail.component';
import { ForumListComponent } from './forum/forum-list/forum-list.component';
import { ThreadDetailComponent } from './forum/thread-detail/thread-detail.component';
import { NewListComponent } from './News/new-list/new-list.component';
import { ScreenerComponent } from './screener/screener.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { authguardGuard } from './_guards/authguard.guard';
import { AlertComponent } from './Alerts/alert/alert.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

export const routes: Routes = 
[
    {path : '', component:HomeComponent},
    {
        path:'',
        runGuardsAndResolvers: 'always',
        canActivate: [authguardGuard],
        children:[
            {path: 'stocks',component:StockListComponent},
            {path: 'stocks/:id', component: StockDetailComponent},
            {path:  'forum',component:ForumListComponent},
            {path: 'forum/thread/:id', component:ThreadDetailComponent},
            {path: 'news',component:NewListComponent},
            {path: 'screener',component:ScreenerComponent},
            {path :'dashboard',component:DashboardComponent},
            
            {path: "profile",component:UserDetailsComponent},
            {path: 'alerts', component:AlertComponent },
            {path:'portfolio',component:PortfolioComponent}
        ]
    },
    {path:'register',component: RegisterComponent},
    {path : '**', component:HomeComponent, pathMatch:'full'}
    
];
