import { Routes } from '@angular/router';
import { StockListComponent } from './stocks/stock-list/stock-list.component';
import { HomeComponent } from './home/home.component';
import { StockDetailComponent } from './stocks/stock-detail/stock-detail.component';

export const routes: Routes = 
[
    {path : '', component:HomeComponent},
    {path: 'stocks',component:StockListComponent},
    {path: 'stocks/:id', component: StockDetailComponent}
];
