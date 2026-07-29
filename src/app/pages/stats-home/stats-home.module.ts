import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StatsHomeComponent } from './stats-home.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { AppMaterialModule } from '../../shared/app-material.module';

const routes: Routes = [{ path: '', component: StatsHomeComponent }];

@NgModule({
  declarations: [StatsHomeComponent, CarouselComponent],
  imports: [CommonModule, AppMaterialModule, RouterModule.forChild(routes)]
})
export class StatsHomeModule {}
