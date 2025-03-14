import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarsComponent } from './pages/cars/cars.component';
import { StatsHomeComponent } from './pages/stats-home/stats-home.component';
import { CarEditComponent } from './pages/car-edit/car-edit.component';
import { PartsComponent } from './pages/parts/parts.component';

@NgModule({
  imports: [RouterModule.forRoot([
    { path: '', component: StatsHomeComponent },  
    { path: 'cars', component: CarsComponent },
    { path: 'cars/:id', component: CarEditComponent },
    { path: 'parts', component: PartsComponent },
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
