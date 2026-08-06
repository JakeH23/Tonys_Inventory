import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { AppMaterialModule } from '../../shared/app-material.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: GalleryComponent }];

@NgModule({
  declarations: [GalleryComponent],
  imports: [CommonModule, AppMaterialModule, SharedModule, ReactiveFormsModule, ScrollingModule, RouterModule.forChild(routes)]
})
export class GalleryModule {}
