import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { CarListStateService } from '../../services/car-list-state.service';
import { CarService } from '../../services/car.service';
import { CoreService } from '../../components/core/core.service';
import { CarsComponent } from './cars.component';

describe('CarsComponent', () => {
  let component: CarsComponent;
  let carService: jasmine.SpyObj<CarService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let stateService: CarListStateService;
  let coreService: jasmine.SpyObj<CoreService>;

  beforeEach(() => {
    carService = jasmine.createSpyObj('CarService', ['getCarList']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    coreService = jasmine.createSpyObj('CoreService', ['openSnackBar']);
    route = {
      queryParams: of({}),
      queryParamMap: of({ get: () => null }),
    } as unknown as ActivatedRoute;
    stateService = new CarListStateService();

    component = new CarsComponent(
      dialog as any,
      carService as any,
      coreService as any,
      router as any,
      route,
      stateService,
      cdr as any
    );
  });

  it('should sync paginator state with the current table data', () => {
    const paginator = {
      pageIndex: 2,
      pageSize: 25,
      length: 0,
      page: new Subject<any>(),
      firstPage: jasmine.createSpy('firstPage'),
    } as unknown as MatPaginator;

    component.paginator = paginator;
    component.pageIndex = 2;
    component.pageSize = 25;
    component.totalCount = 3;

    component['setTableData']([{ Id: 1 } as any, { Id: 2 } as any, { Id: 3 } as any]);

    expect(paginator.length).toBe(3);
    expect(paginator.pageIndex).toBe(2);
    expect(paginator.pageSize).toBe(25);
    expect(component.dataSource.data.length).toBe(3);
  });

  it('should apply the recent filter and label when requested', () => {
    (component as any).allCars = [{ Id: 1 }, { Id: 2 }, { Id: 3 }, { Id: 4 }, { Id: 5 }, { Id: 6 }, { Id: 7 }, { Id: 8 }, { Id: 9 }, { Id: 10 }, { Id: 11 }] as any;

    component.filterRecentlyAdded();

    expect(component.selectedQuickFilter).toBe('recent');
    expect(component.activeFilterLabel).toContain('Recently added');
    expect(component.displayedCars.length).toBe(10);
  });
});
