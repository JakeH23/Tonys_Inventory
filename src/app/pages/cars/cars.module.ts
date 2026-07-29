import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CarsComponent } from './cars.component';
import { CarAddComponent } from '../car-add/car-add.component';
import { CarEditComponent } from '../car-edit/car-edit.component';
import { AppMaterialModule } from '../../shared/app-material.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: CarsComponent },
  { path: ':id', component: CarEditComponent }
];

@NgModule({
  declarations: [CarsComponent, CarAddComponent, CarEditComponent],
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule, SharedModule, RouterModule.forChild(routes)]
})
export class CarsModule {}
