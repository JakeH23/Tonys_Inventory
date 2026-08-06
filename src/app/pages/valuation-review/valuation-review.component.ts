import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car.service';
import { CoreService } from '../../components/core/core.service';
import { StatsService } from '../../services/stats.service';

interface InventoryAlertItem {
  Id: number;
  Make: string;
  Model: string;
  ManufacturersCode: string;
  Boxed: boolean;
  EstimatedValue: number;
}

interface InventoryAlertRule {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  count: number;
  items: InventoryAlertItem[];
}

interface InventoryAlertsResponse {
  generatedAt: string;
  summary: {
    totalCars: number;
    averageValue: number;
    staleValuationDays: number;
    imageCheckSampleSize?: number;
    activeRules: number;
  };
  rules: InventoryAlertRule[];
}

@Component({
  selector: 'app-valuation-review',
  templateUrl: './valuation-review.component.html',
  styleUrls: ['./valuation-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValuationReviewComponent implements OnInit {
  alertsLoading = false;
  alertsError = '';
  inventoryAlerts: InventoryAlertRule[] = [];
  staleDraftValues: Record<number, string> = {};
  staleSavingById: Record<number, boolean> = {};

  constructor(
    private _statsService: StatsService,
    private _carService: CarService,
    private _coreService: CoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getInventoryAlerts();
  }

  getInventoryAlerts() {
    this.alertsLoading = true;
    this.alertsError = '';

    this._statsService.getInventoryAlerts().subscribe({
      next: (res: InventoryAlertsResponse) => {
        this.inventoryAlerts = res?.rules || [];
        this.initializeStaleDraftValues();
        this.alertsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.alertsLoading = false;
        this.alertsError = 'Unable to load valuation review items right now.';
        this.cdr.detectChanges();
      },
    });
  }

  get staleValuationRule(): InventoryAlertRule | null {
    return this.inventoryAlerts.find((rule) => rule.id === 'stale-valuation') || null;
  }

  private initializeStaleDraftValues() {
    const staleItems = this.staleValuationRule?.items || [];
    staleItems.forEach((item) => {
      if (this.staleDraftValues[item.Id] === undefined) {
        this.staleDraftValues[item.Id] = String(item.EstimatedValue);
      }
    });
  }

  getStaleDraftValue(item: InventoryAlertItem): string {
    return this.staleDraftValues[item.Id] ?? String(item.EstimatedValue);
  }

  setStaleDraftValue(itemId: number, value: string) {
    this.staleDraftValues[itemId] = value;
  }

  copyCarName(item: InventoryAlertItem) {
    const label = this.buildCarLabel(item);
    if (!label) {
      this._coreService.openSnackBar('Car name is empty.', 'Dismiss', 'warning');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this._coreService.openSnackBar('Clipboard is not available in this browser.', 'Dismiss', 'warning');
      return;
    }

    navigator.clipboard
      .writeText(label)
      .then(() => this._coreService.openSnackBar(`Copied: ${label}`, 'Dismiss', 'success'))
      .catch(() => this._coreService.openSnackBar('Unable to copy name right now.', 'Dismiss', 'error'));
  }

  openGoogleValuationSearch(item: InventoryAlertItem) {
    const query = this.buildGoogleValuationQuery(item);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }

  private buildGoogleValuationQuery(item: InventoryAlertItem): string {
    const carName = this.buildCarLabel(item);
    const boxedState = item.Boxed ? 'boxed' : 'unboxed';
    return `${carName} ${boxedState} slot car valuation`.trim();
  }

  private buildCarLabel(item: InventoryAlertItem): string {
    const name = `${item.Make || ''} ${item.Model || ''}`.trim();
    const manufacturerCode = (item.ManufacturersCode || '').trim();
    if (!manufacturerCode) {
      return name;
    }

    return `${name} ${manufacturerCode}`.trim();
  }

  isSavingStaleReview(itemId: number): boolean {
    return !!this.staleSavingById[itemId];
  }

  updateStaleValuation(item: InventoryAlertItem) {
    const draft = Number(this.getStaleDraftValue(item));
    if (!Number.isFinite(draft) || draft < 0) {
      this._coreService.openSnackBar('Enter a valid non-negative value first.', 'Dismiss', 'warning');
      return;
    }

    this.submitStaleReview(item, draft);
  }

  dismissStaleValuation(item: InventoryAlertItem) {
    this.submitStaleReview(item, item.EstimatedValue);
  }

  private submitStaleReview(item: InventoryAlertItem, estimatedCost: number) {
    this.staleSavingById[item.Id] = true;

    this._carService
      .bulkUpdateEstimatedValues(
        [
          {
            Id: item.Id,
            EstimatedCost: estimatedCost,
            DateChanged: new Date().toISOString(),
          },
        ],
        false
      )
      .subscribe({
        next: () => {
          this._coreService.openSnackBar('Stale valuation reviewed and logged.', 'Dismiss', 'success');
          this.staleSavingById[item.Id] = false;
          this.getInventoryAlerts();
        },
        error: () => {
          this.staleSavingById[item.Id] = false;
          this._coreService.openSnackBar('Unable to update valuation right now.', 'Dismiss', 'error');
          this.cdr.detectChanges();
        },
      });
  }
}
