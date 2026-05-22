import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { StatusComponent } from './status/status';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'status', component: StatusComponent },
  { path: '**', redirectTo: '' }
];

