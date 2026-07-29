import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from './app-material.module';
import { InventoryStateComponent } from '../components/inventory-state/inventory-state.component';

@NgModule({
  declarations: [InventoryStateComponent],
  imports: [CommonModule, AppMaterialModule],
  exports: [InventoryStateComponent, AppMaterialModule]
})
export class SharedModule {}
