import { Routes } from '@angular/router';
import { StockListComponent } from './stocks/stock-list/stock-list.component';
import { HomeComponent } from './home/home.component';
import { StockDetailComponent } from './stocks/stock-detail/stock-detail.component';
import { ForumListComponent } from './forum/forum-list/forum-list.component';
import { ThreadDetailComponent } from './forum/thread-detail/thread-detail.component';
import { NewListComponent } from './News/new-list/new-list.component';
import { ScreenerComponent } from './screener/screener.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = 
[
    {path : '', component:HomeComponent},
    {path: 'stocks',component:StockListComponent},
    {path: 'stocks/:id', component: StockDetailComponent},
    {path:  'forum',component:ForumListComponent},
    {path: 'forum/thread/:id', component:ThreadDetailComponent},
    {path: 'news',component:NewListComponent},
    {path: 'screener',component:ScreenerComponent},
    {path:'register',component: RegisterComponent},
];
