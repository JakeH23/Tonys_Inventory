import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/stats-home/stats-home.module').then(m => m.StatsHomeModule) },
  { path: 'cars', loadChildren: () => import('./pages/cars/cars.module').then(m => m.CarsModule) },
  { path: 'parts', loadChildren: () => import('./pages/parts/parts.module').then(m => m.PartsModule) },
  { path: 'gallery', loadChildren: () => import('./pages/gallery/gallery.module').then(m => m.GalleryModule) },
  { path: 'bulk-update', loadChildren: () => import('./pages/bulk-update/bulk-update.module').then(m => m.BulkUpdateModule) },
  { path: 'valuation-review', loadChildren: () => import('./pages/valuation-review/valuation-review.module').then(m => m.ValuationReviewModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
