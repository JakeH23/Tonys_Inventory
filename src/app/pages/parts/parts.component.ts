import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PartService } from 'src/app/services/part.service';
import { PartListStateService } from 'src/app/services/part-list-state.service';
import { PartAddComponent } from '../part-add/part-add.component';
import { Part } from 'src/app/models/part.model';
import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';

interface QueryParams {
  q?: string | null;
  category?: string | null;
  side?: string | null;
  pageIndex?: number;
  pageSize?: number;
  sortActive?: string | null;
  sortDirection?: string | null;
}

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss'],
})
export class PartsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'catalogNumber',
    'category',
    'modelNumber',
    'partNumber',
    'vehicleSide',
    'description',
    'action',
  ];
  dataSource = new MatTableDataSource<Part>([]);
  allData: Part[] = [];
  selectedCategory: string | null = null;
  selectedVehicleSide: string | null = null;
  searchValue = '';
  pageIndex = 0;
  pageSize = 5;
  sortActive: string | null = null;
  sortDirection: '' | 'asc' | 'desc' = '';
  isLoading = false;
  hasError = false;
  errorMessage = '';
  activeFilterLabel = 'All parts';
  private paginator?: MatPaginator;
  private sort?: MatSort;
  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    this.paginator = paginator;
    this.syncTableControls();
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    this.sort = sort;
    this.syncTableControls();
  }

  @ViewChild('filterInput') filterInput!: ElementRef; // Add ViewChild for the input field
  private destroy$ = new Subject<void>();

  constructor(
    private _dialog: MatDialog,
    private _partService: PartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private stateService: PartListStateService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cached = this.stateService.snapshot;
      const hasQueryState = ['q', 'category', 'side', 'page', 'size', 'sort', 'dir'].some((key) => params[key] !== undefined);
      const qp = this.parseQueryParams(params);
      this.searchValue = hasQueryState ? (qp.q ?? '').trim() : (cached.q ?? '');
      this.selectedCategory = hasQueryState ? (qp.category ?? null) : (cached.category ?? null);
      this.selectedVehicleSide = hasQueryState ? (qp.side ?? null) : (cached.side ?? null);
      this.pageIndex = hasQueryState ? Math.max(0, qp.pageIndex ?? 0) : Math.max(0, cached.pageIndex ?? 0);
      this.pageSize = hasQueryState ? Math.max(1, qp.pageSize ?? 5) : Math.max(1, cached.pageSize ?? 5);
      this.sortActive = hasQueryState ? (qp.sortActive ?? null) : (cached.sortActive ?? null);
      this.sortDirection = hasQueryState
        ? ((qp.sortDirection as '' | 'asc' | 'desc') || '')
        : ((cached.sortDirection as '' | 'asc' | 'desc') || '');

      if (this.filterInput?.nativeElement) {
        this.filterInput.nativeElement.value = this.searchValue;
      }

      this.applyFilters(false);
      this.syncTableControls();
      this.persistState();
    });

    const cachedData = this.stateService.snapshot.data;
    if (cachedData?.length) {
      this.allData = cachedData;
      this.applyFilters(false);
      this.syncTableControls();
    }

    this.getPartList();

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params.get('action') === 'add') {
        this.openAddPartForm();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddPartForm() {
    const dialogRef = this._dialog.open(PartAddComponent, {
      width: 'min(960px, 95vw)',
      maxWidth: '95vw',
      panelClass: 'theme-dialog-panel',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getPartList();
        }
      },
    });
  }

  getPartList() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this._partService.getPartList({
      page: 1,
      pageSize: 0,
      sortBy: 'Id',
      sortDirection: 'asc',
    }).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        try {
          const items = Array.isArray(res) ? res : (res?.items ?? []);
          this.allData = items;
          this.stateService.setData(items);
          this.applyFilters(false);
          this.syncTableControls();
          this.hasError = false;
        } catch (parseErr) {
          this.hasError = true;
          this.errorMessage = 'Parts data could not be displayed. Please try again.';
          console.error(parseErr);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.hasError = true;
        this.errorMessage = 'We could not load your parts right now. Please try again.';
        console.log(err);
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value.trim();
    this.applyFilters();
    this.updateQueryParams({ q: this.searchValue || null, pageIndex: 0 });
  }

  filterByCategory() {
    this.applyFilters();
    this.updateQueryParams({ category: this.selectedCategory || null, pageIndex: 0 });
  }

  filterByVehicleSide() {
    this.applyFilters();
    this.updateQueryParams({ side: this.selectedVehicleSide || null, pageIndex: 0 });
  }

  clearFilters() {
    this.selectedCategory = null;
    this.selectedVehicleSide = null;
    this.searchValue = '';
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
    }
    this.applyFilters();
    this.updateQueryParams({
      q: null,
      category: null,
      side: null,
      pageIndex: 0,
    });
  }

  onPageChange(page: PageEvent) {
    this.pageIndex = page.pageIndex;
    this.pageSize = page.pageSize;
    this.persistState();
    this.updateQueryParams({ pageIndex: this.pageIndex, pageSize: this.pageSize });
  }

  navigateToId(id?: number) {
    this.router.navigate([`/parts/${id}`], { queryParamsHandling: 'preserve' });
  }

  openEditForm(data: Part) {
    const dialogRef = this._dialog.open(PartAddComponent, {
      data,
      width: '100%',
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getPartList();
        }
      },
    });
  }

  private applyFilters(resetToFirstPage = true) {
    let filtered = [...this.allData];

    if (this.selectedCategory) {
      filtered = filtered.filter((part) => part.Category === this.selectedCategory);
    }

    if (this.selectedVehicleSide) {
      filtered = filtered.filter((part) => part.VehicleSide === this.selectedVehicleSide);
    }

    if (this.searchValue) {
      const terms = this.searchValue.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((part) => {
        const searchable = [
          part.CatalogNumber,
          part.Category,
          part.ModelNumber,
          part.PartNumber,
          part.VehicleSide,
          part.Description,
          part.Notes,
        ]
          .map((value) => (value == null ? '' : String(value).toLowerCase()))
          .join(' ');

        return terms.every((term) => searchable.includes(term));
      });
    }

    this.dataSource.data = filtered;
    this.syncTableControls();
    if (resetToFirstPage && this.paginator) {
      this.pageIndex = 0;
      this.paginator.firstPage();
    }
    this.updateActiveFilterLabel();
    this.persistState();
  }

  private syncTableControls() {
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      const value = item?.[property];
      return typeof value === 'string' ? value.toLowerCase() : value;
    };

    if (this.sort) {
      if (this.sortActive) {
        this.sort.active = this.sortActive;
      }
      this.sort.direction = this.sortDirection;
      this.dataSource.sort = this.sort;
    }

    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      this.dataSource.paginator = this.paginator;
    }
  }

  onSortChange(sort: Sort) {
    this.sortActive = sort.active || null;
    this.sortDirection = (sort.direction as '' | 'asc' | 'desc') || '';
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updateQueryParams({
      sortActive: this.sortActive,
      sortDirection: this.sortDirection || null,
      pageIndex: 0,
    });
    this.persistState();
  }

  private updateQueryParams(params: Partial<QueryParams>) {
    const toSet: Params = {};
    if (params.q !== undefined) toSet['q'] = params.q;
    if (params.category !== undefined) toSet['category'] = params.category;
    if (params.side !== undefined) toSet['side'] = params.side;
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

  private parseQueryParams(params: Params): QueryParams {
    const pageIndex = params['page'] !== undefined ? Number(params['page']) : undefined;
    const pageSize = params['size'] !== undefined ? Number(params['size']) : undefined;
    return {
      q: params['q'] ?? undefined,
      category: params['category'] ?? undefined,
      side: params['side'] ?? undefined,
      pageIndex: Number.isFinite(pageIndex as number) ? pageIndex : undefined,
      pageSize: Number.isFinite(pageSize as number) ? pageSize : undefined,
      sortActive: params['sort'] ?? undefined,
      sortDirection: params['dir'] ?? undefined,
    };
  }

  private persistState() {
    this.stateService.setState({
      q: this.searchValue,
      category: this.selectedCategory,
      side: this.selectedVehicleSide,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortActive: this.sortActive,
      sortDirection: this.sortDirection,
    });
  }

  private updateActiveFilterLabel() {
    const segments: string[] = [];

    if (this.selectedCategory) {
      segments.push(`Category: ${this.selectedCategory}`);
    }

    if (this.selectedVehicleSide) {
      segments.push(`Side: ${this.selectedVehicleSide}`);
    }

    if (this.searchValue) {
      segments.push(`Search: “${this.searchValue}”`);
    }

    this.activeFilterLabel = segments.length ? segments.join(' • ') : 'All parts';
  }
}
