import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { CarImagesService } from '../../services/car-images.service';
import { StatsService } from '../../services/stats.service';
import { StatsHomeComponent } from './stats-home.component';

describe('StatsHomeComponent', () => {
  let component: StatsHomeComponent;
  let statsService: jasmine.SpyObj<StatsService>;
  let carImagesService: jasmine.SpyObj<CarImagesService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    statsService = jasmine.createSpyObj('StatsService', ['getDashboardReport', 'getInventoryAlerts', 'exportCars', 'exportParts']);
    carImagesService = jasmine.createSpyObj('CarImagesService', ['getRandomCarImages']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    component = new StatsHomeComponent(statsService as any, carImagesService as any, cdr as any);
  });

  it('should load dashboard report data and set the empty-state flag when there are no cars', () => {
    statsService.getDashboardReport.and.returnValue(of({ totalCars: 0, totalValue: 0, boxed: 0, unboxed: 0, averageValue: 0, highestValue: [] }));
    statsService.getInventoryAlerts.and.returnValue(of({ summary: { totalCars: 0, averageValue: 0, staleValuationDays: 0, activeRules: 0 }, rules: [] }));
    carImagesService.getRandomCarImages.and.returnValue(of({ carImages: [] }));

    component.ngOnInit();

    expect(component.totalCarsCount).toBe(0);
    expect(component.showEmptyState).toBeTrue();
  });

  it('should expose the correct alert class and icon for each severity', () => {
    expect(component.getAlertClass('error')).toBe('alert-error');
    expect(component.getAlertIcon('warning')).toBe('report_problem');
  });
});
