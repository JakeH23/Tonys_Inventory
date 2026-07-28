import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  dataSource!: MatTableDataSource<any>;
  pageIndex = 0;
  pageSize = 10;
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
    private stateService: CarListStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to route query params so back/forward triggers update
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cached = this.stateService.snapshot;

      // If query params exist use them, otherwise fallback to cached state
      const qp = this.parseQueryParams(params);
      this.filterValue = qp.filter ?? cached.filter ?? '';
      this.pageIndex = qp.pageIndex ?? cached.pageIndex ?? 0;
      this.pageSize = qp.pageSize ?? cached.pageSize ?? 10;
      // set form control without emitting event (we'll control emitting)
      this.filterControl.setValue(this.filterValue, { emitEvent: false });

      // If cached data exists and query params match, reuse it
      const cachedData = cached.data;
      const cachedMatchesQuery =
        !!cachedData &&
        (cached.filter ?? '') === (qp.filter ?? '') &&
        (cached.pageIndex ?? 0) === (qp.pageIndex ?? 0) &&
        (cached.pageSize ?? 10) === (qp.pageSize ?? 10) &&
        (cached.sortActive ?? null) === (qp.sortActive ?? null) &&
        (cached.sortDirection ?? '') === (qp.sortDirection ?? '');

      if (cachedData && cachedMatchesQuery) {
        // reuse cached data without recreating the table state
        this.setTableData(cachedData);
      } else {
        // fetch from server
        this.getCarList(qp);
      }
    });

    // Debounced filter changes
    this.filterControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        this.filterValue = value ?? '';
        this.applyFilterToTable(this.filterValue);
        // update query params (replaceUrl to avoid history flood)
        this.updateQueryParams({ filter: this.filterValue || null, pageIndex: 0 });
        // update cached state (reset to first page)
        this.stateService.setState({ filter: this.filterValue, pageIndex: 0 });
      });
  }

  ngAfterViewInit(): void {
    // When paginator or sort change update query params and cached state
    if (this.paginator) {
      this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((page: PageEvent) => {
        this.pageIndex = page.pageIndex;
        this.pageSize = page.pageSize;
        this.stateService.setState({ pageIndex: page.pageIndex, pageSize: page.pageSize });
        this.updateQueryParams({ pageIndex: page.pageIndex, pageSize: page.pageSize });
      });
    }

    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe((s: Sort) => {
        this.stateService.setState({ sortActive: s.active || null, sortDirection: (s.direction as any) || '' });
        this.updateQueryParams({ sortActive: s.active || null, sortDirection: s.direction || null });
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

  private getCarList(qp?: QueryParams) {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this._carService.getCarList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.setTableData(res);
        this.isLoading = false;

        // save data and state to cache
        this.stateService.setData(res);
        const current = this.stateService.snapshot;
        // merge query params into cached state
        this.stateService.setState({
          filter: qp?.filter ?? current.filter,
          pageIndex: qp?.pageIndex ?? current.pageIndex,
          pageSize: qp?.pageSize ?? current.pageSize,
          sortActive: qp?.sortActive ?? current.sortActive,
          sortDirection: (qp?.sortDirection as any) ?? current.sortDirection,
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'We could not load your cars right now. Please try again.';
        console.log(err);
      },
    });
  }

  private setTableData(data: any[]) {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource(data);
    } else {
      this.dataSource.data = data;
    }

    this.syncPaginatorWithDataSource();

    // Apply current filter without forcing the paginator back to the first page
    if (this.filterValue) {
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
    }
  }

  private syncPaginatorWithDataSource() {
    if (!this.dataSource) {
      return;
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.paginator) {
      const itemCount = this.dataSource.filteredData?.length ?? this.dataSource.data?.length ?? 0;
      this.paginator.length = itemCount;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
    }
  }

  applyFilterToTable(filterValue: string) {
    if (this.dataSource) {
      this.dataSource.filterPredicate = this.defaultFilterPredicate;
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    this.activeFilterLabel = filterValue.trim() ? `Filtered by “${filterValue.trim()}”` : 'All cars';
  }

  // Default filter predicate: stringify row values and perform substring match
  private defaultFilterPredicate = (data: any, filter: string) => {
    const normalizedFilter = (filter || '').trim().toLowerCase();
    if (!normalizedFilter) return true;
    const dataStr = Object.keys(data)
      .map((k) => (data[k] == null ? '' : String(data[k])))
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
    if (!this.dataSource) return;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      if (filter === '__BOXED_TRUE__') return !!data.Boxed;
      if (filter === '__BOXED_FALSE__') return !data.Boxed;
      return this.defaultFilterPredicate(data, filter);
    };
    this.dataSource.filter = boxed ? '__BOXED_TRUE__' : '__BOXED_FALSE__';
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    this.activeFilterLabel = boxed ? 'Boxed cars' : 'Unboxed cars';
  }

  // Filter to recently added cars (heuristic: highest 10 Ids)
  filterRecentlyAdded() {
    if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) return;
    const ids = this.dataSource.data
      .map((d: any) => Number(d.Id) || 0)
      .sort((a: number, b: number) => b - a)
      .slice(0, 10);
    const recentSet = new Set(ids);
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      if (filter === '__RECENT__') return recentSet.has(Number(data.Id));
      return this.defaultFilterPredicate(data, filter);
    };
    this.dataSource.filter = '__RECENT__';
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    this.activeFilterLabel = 'Recently added cars';
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
    const pageIndex = params['page'] ? Number(params['page']) : undefined;
    const pageSize = params['size'] ? Number(params['size']) : undefined;
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