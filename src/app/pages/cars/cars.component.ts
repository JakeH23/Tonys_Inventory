import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarAddComponent } from '../car-add/car-add.component';
import { CarService } from '../../services/car.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from '../../components/core/core.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CarListStateService } from 'src/app/services/car-list-state.service';
import { Car } from 'src/app/models/car.model';

interface QueryParams {
  filter?: string | null;
  pageIndex?: number;
  pageSize?: number;
  sortActive?: string | null;
  sortDirection?: string | null;
}

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss'],
})
export class CarsComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'make',
    'model',
    'manufacturersCode',
    'estimatedValue',
    'boxed',
    'action',
  ];
  dataSource = new MatTableDataSource<Car>([]);
  displayedCars: Car[] = [];
  pageIndex = 0;
  pageSize = 15;
  totalCount = 0;
  private allCars: Car[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  activeFilterLabel = 'All cars';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Use reactive control for debounced filter
  filterControl = new FormControl<string>('');
  filterValue = '';

  private destroy$ = new Subject<void>();

  constructor(
    private _dialog: MatDialog,
    private _carService: CarService,
    private _core_service: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private stateService: CarListStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to route query params so back/forward triggers update
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cached = this.stateService.snapshot;

      const qp = this.parseQueryParams(params);
      this.filterValue = qp.filter ?? cached.filter ?? '';
      this.pageIndex = qp.pageIndex ?? cached.pageIndex ?? 0;
      this.pageSize = qp.pageSize ?? cached.pageSize ?? 15;
      this.filterControl.setValue(this.filterValue, { emitEvent: false });

      this.getCarList(qp);
    });

    // Debounced filter changes
    this.filterControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        this.filterValue = value ?? '';
        this.pageIndex = 0;
        this.activeFilterLabel = this.filterValue ? `Filtered by “${this.filterValue}”` : 'All cars';
        this.stateService.setState({ filter: this.filterValue, pageIndex: 0 });
        this.updateQueryParams({ filter: this.filterValue || null, pageIndex: 0 });
        if (this.allCars.length) {
          this.applyLocalPagination();
        } else {
          this.getCarList();
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe((s: Sort) => {
        this.stateService.setState({ sortActive: s.active || null, sortDirection: (s.direction as any) || '' });
        this.updateQueryParams({ sortActive: s.active || null, sortDirection: s.direction || null });
        if (this.allCars.length) {
          this.applyLocalPagination();
        } else {
          this.getCarList();
        }
      });
    }

    // Ensure paginator + sort applied to existing dataSource if we had cached data and set it earlier
    const cached = this.stateService.snapshot;
    if (this.dataSource) {
      this.syncPaginatorWithDataSource();
      if (this.sort && cached.sortActive) {
        this.sort.active = cached.sortActive;
        this.sort.direction = cached.sortDirection as '' | 'asc' | 'desc';
      }
      // apply filter too
      if (this.filterValue) {
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
      }
    }
  }

  clearFilters() {
    this.filterControl.setValue('', { emitEvent: false });
    this.filterValue = '';
    this.activeFilterLabel = 'All cars';
    this.pageIndex = 0;
    if (this.allCars.length) {
      this.applyLocalPagination();
    } else {
      this.getCarList();
    }
  }

  onPageChange(page: PageEvent) {
    const nextPage = page.pageIndex;
    const nextPageSize = page.pageSize;
    this.pageIndex = nextPage;
    this.pageSize = nextPageSize;
    this.stateService.setState({ pageIndex: nextPage, pageSize: nextPageSize });
    this.applyLocalPagination();
  }

  getTableLength(): number {
    return this.totalCount || this.displayedCars.length || this.dataSource?.data?.length || 0;
  }

  openAddCarForm() {
    const dialogRef = this._dialog.open(CarAddComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          // refresh data and update cache
          this.getCarList();
        }
      },
    });
  }

  getCarList(qp?: QueryParams) {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    if (!this.paginator) {
      this.pageIndex = 0;
      this.pageSize = 15;
    }

    const activeSort = this.sort?.active || qp?.sortActive || 'Id';
    const activeDirection = this.sort?.direction === 'desc' || qp?.sortDirection === 'desc'
      ? 'desc'
      : this.sort?.direction === 'asc' || qp?.sortDirection === 'asc'
        ? 'asc'
        : 'asc';

    this._carService.getCarList({
      page: undefined,
      pageSize: 0,
      sortBy: activeSort,
      sortDirection: activeDirection,
      search: this.filterValue,
      filter: this.activeFilterLabel === 'Boxed cars' ? 'boxed' : this.activeFilterLabel === 'Unboxed cars' ? 'unboxed' : undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const payload = this.normalizeResponse(res);
        this.pageIndex = Math.max(0, qp?.pageIndex ?? this.pageIndex);
        this.pageSize = qp?.pageSize ?? (this.pageSize || payload.pageSize || 15);
        this.allCars = payload.items;
        this.totalCount = payload.total;
        this.applyLocalPagination();
        this.isLoading = false;
        this.cdr.detectChanges();

        this.stateService.setData(payload.items);
        const current = this.stateService.snapshot;
        // merge query params into cached state
        this.stateService.setState({
          filter: qp?.filter ?? current.filter,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          sortActive: qp?.sortActive ?? current.sortActive ?? activeSort,
          sortDirection: (qp?.sortDirection as any) ?? current.sortDirection ?? activeDirection,
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'We could not load your cars right now. Please try again.';
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  private normalizeResponse(res: any) {
    if (Array.isArray(res)) {
      return {
        items: res as Car[],
        total: res.length,
        page: 1,
        pageSize: res.length,
      };
    }

    return {
      items: (res?.items as Car[]) ?? [],
      total: res?.total ?? (res?.items?.length ?? 0),
      page: res?.page ?? 1,
      pageSize: this.pageSize,
    };
  }

  private applyLocalPagination() {
    const sorted = this.getSortedCars();
    const filtered = this.applyClientFilter(sorted);
    this.totalCount = filtered.length;

    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    const pageItems = filtered.slice(start, end);

    this.setTableData(pageItems);

    if (this.paginator) {
      this.paginator.length = this.totalCount;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
    }
  }

  private getSortedCars(): Car[] {
    const sorted = [...this.allCars];
    const sortField = this.sort?.active || 'Id';
    const direction = this.sort?.direction === 'desc' ? -1 : 1;

    sorted.sort((a, b) => {
      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });

    return sorted;
  }

  private applyClientFilter(cars: Car[]): Car[] {
    let filteredCars = [...cars];

    if (this.activeFilterLabel === 'Boxed cars') {
      filteredCars = filteredCars.filter((car) => !!car.Boxed);
    } else if (this.activeFilterLabel === 'Unboxed cars') {
      filteredCars = filteredCars.filter((car) => !car.Boxed);
    } else if (this.activeFilterLabel === 'Recently added cars') {
      filteredCars = filteredCars
        .slice()
        .sort((a, b) => (b.Id ?? 0) - (a.Id ?? 0))
        .slice(0, 10);
    }

    const normalizedFilter = (this.filterValue || '').trim().toLowerCase();
    if (!normalizedFilter) {
      return filteredCars;
    }

    return filteredCars.filter((car) => {
      const searchableValues = [
        car.ManufacturersCode,
        car.Make,
        car.Model,
        car.EstimatedValue,
        car.Boxed,
        car.Notes,
        car.Image,
      ];
      const dataStr = searchableValues
        .map((value) => (value == null ? '' : String(value)))
        .join(' ')
        .toLowerCase();
      return dataStr.includes(normalizedFilter);
    });
  }

  private setTableData(data: Car[]) {
    this.displayedCars = data;
    this.dataSource.data = data;
    this.syncPaginatorWithDataSource();
    this.cdr.detectChanges();
  }

  private syncPaginatorWithDataSource() {
    if (!this.dataSource) {
      return;
    }

    this.dataSource.sort = this.sort;

    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalCount;
    }
  }

  applyFilterToTable(filterValue: string) {
    this.filterValue = filterValue.trim();
    this.activeFilterLabel = this.filterValue ? `Filtered by “${this.filterValue}”` : 'All cars';
    this.pageIndex = 0;
    this.getCarList();
  }

  // Default filter predicate: stringify row values and perform substring match
  private defaultFilterPredicate = (data: Car, filter: string) => {
    const normalizedFilter = (filter || '').trim().toLowerCase();
    if (!normalizedFilter) return true;
    const searchableValues = [
      data.ManufacturersCode,
      data.Make,
      data.Model,
      data.EstimatedValue,
      data.Boxed,
      data.Notes,
      data.Image,
    ];
    const dataStr = searchableValues
      .map((value) => (value == null ? '' : String(value)))
      .join(' ')
      .toLowerCase();
    return dataStr.indexOf(normalizedFilter) !== -1;
  };

  // Called from template input (keyup)
  applyFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value ?? '';
    // Reset any special predicates and use the reactive control pipeline
    this.filterControl.setValue(val);
  }

  // Filter rows by `Boxed` boolean
  filterBoxed(boxed: boolean) {
    this.pageIndex = 0;
    this.activeFilterLabel = boxed ? 'Boxed cars' : 'Unboxed cars';
    this.stateService.setState({ pageIndex: 0, pageSize: this.pageSize });
    this.updateQueryParams({ pageIndex: 0, pageSize: this.pageSize });
    if (this.allCars.length) {
      this.applyLocalPagination();
    } else {
      this.getCarList();
    }
  }

  // Filter to recently added cars (heuristic: highest 10 Ids)
  filterRecentlyAdded() {
    this.pageIndex = 0;
    this.activeFilterLabel = 'Recently added cars';
    this.stateService.setState({ pageIndex: 0, pageSize: this.pageSize });
    this.updateQueryParams({ pageIndex: 0, pageSize: this.pageSize });
    if (this.allCars.length) {
      this.applyLocalPagination();
    } else {
      this.getCarList();
    }
  }

  // helper to build and push query params
  private updateQueryParams(params: Partial<QueryParams>) {
    const toSet: Params = {};
    if (params.filter !== undefined) toSet['filter'] = params.filter;
    if (params.pageIndex !== undefined) toSet['page'] = params.pageIndex;
    if (params.pageSize !== undefined) toSet['size'] = params.pageSize;
    if (params.sortActive !== undefined) toSet['sort'] = params.sortActive;
    if (params.sortDirection !== undefined) toSet['dir'] = params.sortDirection;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toSet,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // parse query params into typed object
  private parseQueryParams(params: Params): QueryParams {
    const pageIndex = params['page'] !== undefined ? Number(params['page']) : undefined;
    const pageSize = params['size'] !== undefined ? Number(params['size']) : undefined;
    const filter = params['filter'] ?? undefined;
    const sortActive = params['sort'] ?? undefined;
    const sortDirection = params['dir'] ?? undefined;
    return { filter, pageIndex, pageSize, sortActive, sortDirection };
  }

  navigateToId(id: number) {
    // prefer preserve so browser back returns exactly
    this.router.navigate([`/cars/${id}`], { queryParamsHandling: 'preserve' });
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(CarAddComponent, {
      data,
      width: '100%',
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getCarList();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}