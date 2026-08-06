import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PartListStateService } from '../../services/part-list-state.service';
import { PartService } from '../../services/part.service';
import { PartsComponent } from './parts.component';

describe('PartsComponent query params', () => {
  let component: PartsComponent;
  let router: jasmine.SpyObj<Router>;
  let route: any;
  let partService: jasmine.SpyObj<PartService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    partService = jasmine.createSpyObj('PartService', ['getPartList']);
    partService.getPartList.and.returnValue(of([{ Id: 1 }] as any));
    route = {
      queryParams: of({ q: 'brake', category: 'Mechanical', side: 'N/S', page: '1', size: '10', sort: 'CatalogNumber', dir: 'asc' }),
      queryParamMap: of({ get: () => null }),
    };

    component = new PartsComponent(
      jasmine.createSpyObj('MatDialog', ['open']) as any,
      partService as any,
      router as any,
      route as ActivatedRoute,
      jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']) as any,
      new PartListStateService()
    );
  });

  it('should restore the search and filter selections from query params', () => {
    component.ngOnInit();

    expect(component.searchValue).toBe('brake');
    expect(component.selectedCategory).toBe('Mechanical');
    expect(component.selectedVehicleSide).toBe('N/S');
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });
});
