import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BulkUpdateComponent } from './bulk-update.component';
import { AppMaterialModule } from '../../shared/app-material.module';

const routes: Routes = [{ path: '', component: BulkUpdateComponent }];

@NgModule({
  declarations: [BulkUpdateComponent],
  imports: [CommonModule, AppMaterialModule, RouterModule.forChild(routes)],
})
export class BulkUpdateModule {}
