import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PartListStateService } from '../../services/part-list-state.service';
import { PartService } from '../../services/part.service';
import { PartsComponent } from './parts.component';

describe('PartsComponent', () => {
  let component: PartsComponent;
  let partService: jasmine.SpyObj<PartService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let stateService: PartListStateService;

  beforeEach(() => {
    partService = jasmine.createSpyObj('PartService', ['getPartList']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    route = {
      queryParams: of({}),
      queryParamMap: of({ get: () => null }),
    } as unknown as ActivatedRoute;
    stateService = new PartListStateService();

    component = new PartsComponent(
      dialog as any,
      partService as any,
      router as any,
      route,
      cdr as any,
      stateService
    );
  });

  it('should load parts and apply the current filters', () => {
    component.allData = [
      { Id: 1, CatalogNumber: 'ABC-1', Category: 'Electrical', VehicleSide: 'N/S', Description: 'Headlight' },
      { Id: 2, CatalogNumber: 'XYZ-2', Category: 'Mechanical', VehicleSide: 'N/S', Description: 'Bracket' },
    ] as any;

    component['applyFilters'](false);

    expect(component.allData.length).toBe(2);
    expect(component.dataSource.data.length).toBe(2);
    expect(component.activeFilterLabel).toBe('All parts');
  });

  it('should filter parts by category and search text', () => {
    component.allData = [
      { Id: 1, CatalogNumber: 'ABC-1', Category: 'Electrical', VehicleSide: 'N/S', Description: 'Headlight' },
      { Id: 2, CatalogNumber: 'XYZ-2', Category: 'Mechanical', VehicleSide: 'N/S', Description: 'Bracket' },
    ] as any;
    component.selectedCategory = 'Electrical';
    component.searchValue = 'headlight';

    component['applyFilters'](false);

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].Id).toBe(1);
    expect(component.activeFilterLabel).toContain('Category: Electrical');
  });
});
