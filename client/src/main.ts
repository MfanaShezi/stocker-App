/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Chart, registerables } from 'chart.js';
import { environment } from './environments/environment';

Chart.register(...registerables);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  if(environment.production){
    console.log("Production mode enabled");
    console.log("API URL: " + environment.apiUrl);
  }
  else{
    console.log("Development mode enabled");
    console.log("API URL: " + environment.apiUrl);
  }
