import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { AppMaterialModule } from '../../shared/app-material.module';

const routes: Routes = [{ path: '', component: GalleryComponent }];

@NgModule({
  declarations: [GalleryComponent],
  imports: [CommonModule, AppMaterialModule, ScrollingModule, RouterModule.forChild(routes)]
})
export class GalleryModule {}
