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
    // Restore state from query params or cached state
    const cached = this.stateService.snapshot;

    // Subscribe to route query params so back/forward triggers update
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      // If query params exist use them, otherwise fallback to cached state
      const qp = this.parseQueryParams(params);
      this.filterValue = qp.filter ?? cached.filter ?? '';
      // set form control without emitting event (we'll control emitting)
      this.filterControl.setValue(this.filterValue, { emitEvent: false });

      // If cached data exists and query params match, reuse it
      const cachedData = cached.data;
      const cachedMatchesQuery =
        cachedData &&
        (cached.filter === qp.filter) &&
        (cached.pageIndex === qp.pageIndex) &&
        (cached.pageSize === qp.pageSize) &&
        (cached.sortActive === qp.sortActive) &&
        (cached.sortDirection === qp.sortDirection);

      if (cachedData && cachedMatchesQuery) {
        // reuse cached data
        this.setTableData(cachedData);
        // paginator/sort will be applied in AfterViewInit when view children are ready
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
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // apply restored paginator & sort
      if (this.paginator && typeof cached.pageIndex === 'number') {
        this.paginator.pageIndex = cached.pageIndex;
        this.paginator.pageSize = cached.pageSize ?? this.paginator.pageSize;
      }
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
    this._carService.getCarList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.setTableData(res);

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
      error: console.log,
    });
  }

  private setTableData(data: any[]) {
    this.dataSource = new MatTableDataSource(data);
    // if view children already exist, assign them
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    // apply current filter if any
    if (this.filterValue) {
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  applyFilterToTable(filterValue: string) {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
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