import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StatsService } from '../../services/stats.service';
import { CarImage } from '../../components/carousel/carousel.interface';
import { CarImagesService } from '../../services/car-images.service';
import { Car } from '../../models/car.model';
import { getMostRecentEstimatedValue } from '../../models/estimated-value.model';

interface InventoryAlertItem {
  Id: number;
  Make: string;
  Model: string;
  ManufacturersCode: string;
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
    activeRules: number;
  };
  rules: InventoryAlertRule[];
}

@Component({
  selector: 'app-stats-home',
  templateUrl: './stats-home.component.html',
  styleUrls: ['./stats-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsHomeComponent implements OnInit {
  cars: CarImage[] = [];

  totalCarsCount = 0;
  totalCarsValue = 0;
  boxedTotal = 0;
  unboxedTotal = 0;
  averageValue = 0;
  reportLoading = false;
  reportError = '';
  alertsLoading = false;
  alertsError = '';
  inventoryAlerts: InventoryAlertRule[] = [];
  alertsSummary: InventoryAlertsResponse['summary'] | null = null;
  displayedColumns: string[] = [
    'make',
    'model',
    'manufacturersCode',
    'estimatedValue',
  ];
  dataSource = new MatTableDataSource<any>([]);


  constructor(
    private _statsService: StatsService,
    private _carImagesService: CarImagesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getRandomCarImages();
    this.getDashboardReport();
    this.getInventoryAlerts();
    this.cdr.detectChanges();
  }

  getRandomCarImages() {
    this._carImagesService.getRandomCarImages().subscribe({
      next: (res: { carImages: CarImage[] }) => {
        this.cars = res.carImages;
        this.cdr.detectChanges();
      },
      error: console.log,
    });
  }

  getDashboardReport() {
    this.reportLoading = true;
    this.reportError = '';
    this._statsService.getDashboardReport().subscribe({
      next: (res) => {
        this.totalCarsCount = res.totalCars;
        this.totalCarsValue = res.totalValue;
        this.boxedTotal = res.boxed;
        this.unboxedTotal = res.unboxed;
        this.averageValue = res.averageValue;
        this.dataSource = new MatTableDataSource(res.highestValue);
        this.reportLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reportLoading = false;
        this.reportError = 'Unable to load the latest analytics.';
        console.log(err);
        this.cdr.detectChanges();
      },
    });
  }

  get showEmptyState(): boolean {
    return !this.reportLoading && !this.reportError && this.totalCarsCount === 0;
  }

  getInventoryAlerts() {
    this.alertsLoading = true;
    this.alertsError = '';

    this._statsService.getInventoryAlerts().subscribe({
      next: (res: InventoryAlertsResponse) => {
        this.inventoryAlerts = res?.rules || [];
        this.alertsSummary = res?.summary || null;
        this.alertsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.alertsLoading = false;
        this.alertsError = 'Unable to load inventory alerts right now.';
        console.log(err);
        this.cdr.detectChanges();
      },
    });
  }

  getAlertClass(severity: InventoryAlertRule['severity']): string {
    return `alert-${severity}`;
  }

  getAlertIcon(severity: InventoryAlertRule['severity']): string {
    switch (severity) {
      case 'error':
        return 'warning';
      case 'warning':
        return 'report_problem';
      default:
        return 'info';
    }
  }

  exportCars() {
    this._statsService.exportCars().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'cars-export.csv';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: console.log,
    });
  }

  exportParts() {
    this._statsService.exportParts().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'parts-export.csv';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: console.log,
    });
  }

  getCurrentEstimatedValue(car: Car): number {
    return getMostRecentEstimatedValue(car?.EstimatedValue);
  }
}
