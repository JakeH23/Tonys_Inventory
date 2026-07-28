import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-inventory-state',
  templateUrl: './inventory-state.component.html',
  styleUrls: ['./inventory-state.component.scss'],
})
export class InventoryStateComponent {
  @Input() loading = false;
  @Input() error = false;
  @Input() empty = false;
  @Input() title = 'No data';
  @Input() message = '';
  @Input() icon = 'info';
  @Input() loadingMessage = 'Loading…';
  @Input() retryLabel = 'Try again';
  @Input() showRetryButton = false;

  @Output() retry = new EventEmitter<void>();
}
