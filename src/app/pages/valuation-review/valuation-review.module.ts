import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppMaterialModule } from '../../shared/app-material.module';
import { SharedModule } from '../../shared/shared.module';
import { ValuationReviewComponent } from './valuation-review.component';

const routes: Routes = [{ path: '', component: ValuationReviewComponent }];

@NgModule({
  declarations: [ValuationReviewComponent],
  imports: [CommonModule, AppMaterialModule, SharedModule, RouterModule.forChild(routes)],
})
export class ValuationReviewModule {}
