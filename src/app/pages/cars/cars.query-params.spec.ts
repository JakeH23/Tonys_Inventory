import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CoreService } from '../../components/core/core.service';
import { CarListStateService } from '../../services/car-list-state.service';
import { CarService } from '../../services/car.service';
import { CarsComponent } from './cars.component';

describe('CarsComponent query params', () => {
  let component: CarsComponent;
  let router: jasmine.SpyObj<Router>;
  let route: any;
  let carService: jasmine.SpyObj<CarService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    carService = jasmine.createSpyObj('CarService', ['getCarList']);
    carService.getCarList.and.returnValue(of({ items: [], total: 0, page: 1, pageSize: 15 } as any));
    route = {
      queryParams: of({ page: '2', size: '20', sort: 'Make', dir: 'asc', filter: 'ford' }),
      queryParamMap: of({ get: () => null }),
    };

    component = new CarsComponent(
      jasmine.createSpyObj('MatDialog', ['open']) as any,
      carService as any,
      jasmine.createSpyObj('CoreService', ['openSnackBar']) as any,
      router as any,
      route as ActivatedRoute,
      new CarListStateService(),
      jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']) as any
    );
  });

  it('should parse query params into the component state', () => {
    component.ngOnInit();

    expect(component.filterValue).toBe('ford');
    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(20);
  });
});
