import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PartsComponent } from './parts.component';
import { PartAddComponent } from '../part-add/part-add.component';
import { PartEditComponent } from '../part-edit/part-edit.component';
import { AppMaterialModule } from '../../shared/app-material.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: PartsComponent },
  { path: ':id', component: PartEditComponent }
];

@NgModule({
  declarations: [PartsComponent, PartAddComponent, PartEditComponent],
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule, SharedModule, RouterModule.forChild(routes)]
})
export class PartsModule {}
